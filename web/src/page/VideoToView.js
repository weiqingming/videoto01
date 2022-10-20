
import React, { Component } from 'react';
import '@douyinfe/semi-ui/dist/css/semi.min.css';
import { Button } from '@douyinfe/semi-ui';
import CommonService from '../service/CommonService';

const blackView = <div style={{ width: 10, height: 10, background: '#000000' }} />;
const imageView = <img src='图片地址' style={{ width: 10, height: 10 }} />;
const whiteView = <div style={{ width: 10, height: 10, background: '#ffffff' }} />;

class VideoToView extends Component {

    // 按钮文字
    buttonText = '起飞';
    // 视频转换成0-1矩阵地址
    videoUrl = '视频地址';

    /**
     * 在渲染前调用
     * */
    componentWillMount() {
    }

    /** 根据ID取组件 */
    querySelector = (name) => {
        return document.querySelector('#' + name);
    }

    /** 刷新页面 */
    refresh = () => {
        this.setState({
            ...this.state
        })
    }

    /** 设置当前实例内某个数据后刷新页面 */
    refreshByKey = (key, value) => {
        this[key] = value;
        this.refresh();
    }

    /**
     * 获取后台数据
     */
    getData = () => {
        this.refreshByKey('buttonText', '正在加载中，请稍后...')

        // 请求后台数据成功的处理
        let success = (data) => {
            // 数据请求完成，隐藏按钮
            this.refreshByKey('buttonText', '');
            // 播放
            this.play(data);
        };

        // 请求失败的处理
        let fail = () => {
            this.refreshByKey('buttonText', '加载失败，请检查');
        }

        // 服务端参数
        let requestParam = { videoUrl: this.videoUrl, width: '125', height: '50', threshold: '140' };
        let requestUrl = 'http://localhost:8080/videoTo01.json';
        CommonService.requestSend(requestUrl, requestParam, success, fail)
    }

    /** 播放器 */
    play = (data) => {
        // 设置服务端返回的数据，和开始播放参照视频
        let videoArrays = data;

        // 取出视频播放器
        let video = this.querySelector('video');
        video.src = this.videoUrl;
        // 监听开始播放事件，视频播放的同时，开始播放0-1矩阵动画
        video.onplay = () => {

            // 矩阵动画播放器
            let player = () => {
                setTimeout(() => {
                    // 重置当前显示帧的view矩阵
                    this.frameViews = [];
                    // 取当前帧
                    let frame = videoArrays[0];
                    // 像素行
                    for (let row of frame) {
                        let cols = [];
                        // 像素行内的像素列
                        for (let col of row) {
                            // 判断0显示黑色方块，其他显示白色方块
                            if (col === '0') {
                                cols.push(imageView)
                            } else {
                                cols.push(whiteView)
                            }
                        }
                        // 往当前显示帧里添加转换好的行view
                        this.frameViews.push(<div style={{ display: 'flex', justifyContent: 'center' }}>{cols}</div>);
                    }
                    // 设置后，删除此条数据
                    videoArrays.shift();
                    // 刷新矩阵文本框
                    this.refresh();

                    // 如果列表里还有数据，继续循环
                    if (videoArrays.length > 0) {
                        player();
                    } else {
                        // 播放完成，显示按钮
                        this.refreshByKey('buttonText', '再次起飞')
                    }
                }, frameRate);
            }

            // 每秒帧速，第一次不需要间隔时间
            let frameRate = 0;
            player();
            // 第二次开始，按帧率设置
            frameRate = 1000 / 32;
        }
    }

    render() {
        return (
            <div >
                {/* 播放容器 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {this.frameViews}
                </div>

                {/* 按钮 */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 15 }}>
                    {
                        this.buttonText !== '' ? <Button onClick={this.getData}>{this.buttonText}</Button> : []
                    }
                </div>

                {/* 视频对照 */}
                <div style={{ position: 'fixed', top: 0, right: 30 }}>
                    <video muted autoPlay id='video' style={{ height: 200 }}></video>
                </div>
            </div >
        )
    }
}


export default VideoToView;
