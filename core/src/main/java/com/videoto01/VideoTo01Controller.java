package com.videoto01;

import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.bytedeco.javacv.Frame;
import org.bytedeco.javacv.Java2DFrameConverter;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class VideoTo01Controller {

    // 缓存（数据多了得优化，不然内存溢出）
    private static Map<String, Object> RESULT = new HashMap<>();

    /**
     * 获取视频转01二维数组矩阵
     * @return
     */
    @RequestMapping(value = "videoTo01.json", method = RequestMethod.POST)
    public Map<String, Object> videoTo01(@RequestBody Map<String, String> param) {

        // 返回结果
        Map<String, Object> res = new HashMap<>();

        try {

            isTrue(null != param.get("videoUrl"), "videoUrl必须传递");
            int width = Integer.parseInt(param.get("width") == null ? "150" : param.get("width"));
            int height = Integer.parseInt(param.get("height") == null ? "40" : param.get("height"));
            int threshold = Integer.parseInt(param.get("threshold") == null ? "155" : param.get("threshold"));
            String cacheKey = param.get("videoUrl") + width + height + threshold;

            // 优先取缓存
            if (null != RESULT && null != RESULT.get(cacheKey)) {
                return (Map<String, Object>) RESULT.get(cacheKey);
            }

            // 1、获取视频InputStream
            InputStream inputStream = getVideoStream(param.get("videoUrl"));

            // 2、逐帧转换成图片 and 把每一帧图片按照图片像素转换成0和1的二维数组阵列
            List<String[][]> list = frameTo01Array(inputStream, width, height, threshold);

            // 组装，返回给前端
            res.put("success", true);
            res.put("data", list);

            // 缓存，首次处理很慢
            if (!CollectionUtils.isEmpty(list)) {
                RESULT.put(cacheKey, res);
            }

        } catch (Exception e) {
            res.put("success", false);
            res.put("errorMsg", e.getMessage());
        }

        return res;
    }

    /**
     * 播放
     * @param list
     */
    private void play(List<String[][]> list){
        List<String> plays = new ArrayList<>();
        for (String[][] item : list){
            StringBuilder s = new StringBuilder();
            for (String[] row : item){
                for (String col : row){
                    s.append(col);
                }
                s.append("\r\n");
            }
            plays.add(s.toString());
        }

        for (String item : plays){
            try {
                Thread.sleep(1000 / 30);
                System.out.print(item);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 获取视频InputStream
     *
     * @param videoUrl
     * @return
     * @throws Exception
     */
    private static InputStream getVideoStream(String videoUrl) throws Exception {
        // new一个URL对象
        URL url = new URL(videoUrl);
        // 打开链接
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        // 设置请求方式为"GET"
        conn.setRequestMethod("GET");
        // 超时响应时间为30秒
        conn.setConnectTimeout(30 * 1000);
        // 获取与返回视频流数据
        return conn.getInputStream();
    }

    /**
     * 视频流所有帧转成image
     * @param inputStream 视频流
     * @param width 宽
     * @param height 高
     * @param threshold 颜色阈值
     * @return
     */
    private static List<String[][]> frameTo01Array(InputStream inputStream, int width, int height, int threshold){
        // 返回二维数组结果
        List<String[][]> result = new ArrayList<>();

        // 帧工作流
        FFmpegFrameGrabber frameGrabber = null;
        try {

            // 获取帧工作流后开始处理
            frameGrabber = new FFmpegFrameGrabber(inputStream);
            frameGrabber.start();
            Frame frame;

            // 循环逐帧处理
            while (true) {

                // 取当前帧
                frame = frameGrabber.grabFrame();
                if (null != frame) {

                    //将获取的帧，转换为图片
                    Java2DFrameConverter converter = new Java2DFrameConverter();
                    BufferedImage image = converter.getBufferedImage(frame);
                    if (null == image) {
                        continue;
                    }

                    // 指定每一帧的图片大小
                    Image tmp = image.getScaledInstance(width, height, Image.SCALE_SMOOTH);
                    BufferedImage nImg = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
                    Graphics2D g2d = nImg.createGraphics();
                    g2d.drawImage(tmp, 0, 0, null);
                    g2d.dispose();

                    // 二值化（其实就是转黑白的意思，其实转黑白，在没有进行处理过的视频上，效果不太好）
//                    BufferedImage blackWhite = new BufferedImage(215, 80, BufferedImage.TYPE_BYTE_BINARY);
//                    Graphics2D blackWhiteG2d = blackWhite.createGraphics();
//                    blackWhiteG2d.drawImage(tmp, 0, 0, null);
//                    blackWhiteG2d.dispose();

                    // 将图片，转成矩阵
                    result.add(toArrays(nImg, threshold));
                }

                // 取不到帧数据时，认为已经处理完毕，停止遍历
                else {
                    break;
                }
            }

        } catch (Throwable e) {
            e.printStackTrace();
        } finally {
            try {
                if (null != inputStream) inputStream.close();
                if (null != frameGrabber ) frameGrabber.stop();
            } catch (IOException e){
                e.printStackTrace();
            }
        }

        return result;
    }

    /**
     * 把图片转成0-1的矩阵
     * @param image
     * @return
     */
    public static String[][] toArrays(BufferedImage image, int threshold) {
        int w = image.getWidth();
        int h = image.getHeight();

        // 矩阵数组
        String[][] matrix = new String[h][w];

        // 开始遍历
        for (int i = 0; i < h; i++) {
            for (int j = 0; j < w; j++) {
                // 取RGB值
                int rgb = image.getRGB(j, i);
                // 获取rgb的色值
                int r = image.getColorModel().getRed(rgb);
                int g = image.getColorModel().getGreen(rgb);
                int b = image.getColorModel().getBlue(rgb);
                // 设置阈值，可以根据自己的需要调整，0-255之间
                int t = threshold;
                // 当前像素的R、G、B是否超过阈值，超过认为白色，否则黑色（根据需要进行调整）
                if (r > t && g > t && b > t) {
                    matrix[i][j] = "1";
                } else {
                    matrix[i][j] = "0";
                }
            }
        }
        return matrix;
    }

    public void isTrue(boolean b, String message) {
        if (!b) {
            throw new VideoTo01Error(message);
        }
    }

    static class VideoTo01Error extends RuntimeException {
        public VideoTo01Error(String message) {
            super(message);
        }
    }
}
