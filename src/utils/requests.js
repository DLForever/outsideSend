import axios from 'axios'
import ElementUI from 'element-ui';

axios.interceptors.request.use(
    config => {
        config.headers.Authorization = localStorage.getItem('token')
        // loadinginstace = Loading.service({ fullscreen: true })
        // loadinginstace = ElementUI.loading({
        //     lock: true,
        //     text: 'Loading',
        //     spinner: 'el-icon-loading',
        //     background: 'rgba(0, 0, 0, 0.7)'
        // })
        return config
    }
    )

axios.interceptors.response.use(
    // ElementUI.Message.error('response in66666'),
    response => {
        // loadinginstace.close()
        if (response.data.code != 200) {
            ElementUI.Message.error(response.data.message)
        }
        return response
    },
    error => {
        ElementUI.Message.error('服务器更新中')
    }
    )