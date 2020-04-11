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
        if (response.data.code == 300) {
            return response
        }
        if (response.data.code != 200) {
            ElementUI.Message.error(response.data.message)
        }
        if (response.data.code == 1005) {
            ElementUI.Message.info('服务器更新中,请稍等')
        }
        if (response.data.code == 1500) {
            Vue.prototype.$alert('登陆过期，请重新登陆！', '提示', {
                    confirmButtonText: '确定',
                    // cancelButtonText: '取消',
                    type: 'info'
                }).then(() => {
                    clearInterval(localStorage.getItem('myVal'))
                    localStorage.removeItem('token')
                    localStorage.removeItem('notifyid')
                    localStorage.removeItem('ms_username')
                    localStorage.removeItem('restrict')
                    router.push('/login')
                }).catch((res) => {
                    clearInterval(localStorage.getItem('myVal'))
                    localStorage.removeItem('token')
                    localStorage.removeItem('notifyid')
                    localStorage.removeItem('ms_username')
                    localStorage.removeItem('restrict')
                    router.push('/login')
                })
        }
        return response
    },
    error => {
        ElementUI.Message.error('服务器更新中')
    }
    )