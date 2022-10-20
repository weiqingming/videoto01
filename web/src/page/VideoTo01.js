
import React, { Component } from 'react';
import '@douyinfe/semi-ui/dist/css/semi.min.css';
import { Button } from '@douyinfe/semi-ui';
import CommonService from '../service/CommonService';
import { Input } from 'antd';

class VideoTo01 extends Component {

    // 按钮文字
    buttonText = '起飞';
    // 视频转换成0-1矩阵地址
    videoUrl = '视频地址';

    /**
     * 在渲染前调用
     * */
    componentWillMount() {
        let a = window.localStorage.getItem('hehe');
        if (a) this.name = a;
        this.ikun = "";
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
     * 获取后端数据
     */
    getIkun = () => {
        this.refreshByKey('buttonText', '正在处理中，请稍后...');

        // 请求后台数据成功的处理
        let success = (data) => {
            // 数据请求完成，隐藏按钮
            this.refreshByKey('buttonText', '');
            // 播放
            this.play(data);
        }

        // 请求失败的处理
        let fail = () => {
            this.refreshByKey('buttonText', '加载失败，请检查');
        }

        // 服务端参数
        let requestParam = { videoUrl: this.videoUrl };
        let requestUrl = 'http://localhost:8080/videoTo01.json';
        CommonService.requestSend(requestUrl, requestParam, success, fail, false);
    }

    /**
     * 播放器
     * @param {帧列表二维数组} data 
     */
    play = (data) => {

        // 设置服务端返回的数据，和开始播放参照视频
        let videoArrays = data;
        let video = this.querySelector('video');
        video.src = this.videoUrl;

        // 视频播放的同时，开始播放0-1矩阵动画
        video.onplay = () => {

            // 字符串矩阵动播放器
            let player = () => {
                setTimeout(() => {

                    this.frameString = '';
                    // 将每一帧的数组矩阵，转成一条字符串数据，便于前端直接显示
                    for (let row of videoArrays[0]) {
                        for (let col of row) {
                            this.frameString += col;
                        }
                        this.frameString += "\r\n";
                    }

                    // 设置后，删除此条数据
                    videoArrays.shift();
                    // 刷新矩阵文本框
                    this.refresh();

                    // 如果列表里还有数据，继续循环（有点像递归，但不是）
                    if (videoArrays.length > 0) {
                        player();
                    } else {
                        // 播放完成，显示按钮
                        this.refreshByKey('buttonText', '再次起飞')
                    }
                }, frameNum);
            }

            // 每秒帧速，第一帧不需要间隔时间
            let frameNum = 0;
            player();
            // 第二帧开始，按帧率设置间隔时间
            frameNum = 1000 / 32;
        }
    }

    render() {

        return (
            <div >
                {/* 使用一个可以换行的input控件作为显示载体 */}
                <Input.TextArea style={{ fontSize: 10, color: '#000000', background: '#ffffff', textAlign: 'center' }} value={this.frameString} size="small" autoSize/>

                {/* 播放按钮 */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 15 }}>
                    {
                        this.buttonText !== '' ? <Button onClick={this.getIkun}>{this.buttonText}</Button> : []
                    }
                </div>

                {/* 视频对照 */}
                <div style={{ position: 'fixed', top: 0, right: 30 }}>
                    <video autoPlay id='video' style={{ height: 200 }}></video>
                </div>
            </div >
        )
    }
}


export default VideoTo01;
