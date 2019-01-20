
require('./bootstrap');

window.Vue = require('vue');

import Vue from 'vue'
import VueChatScroll from 'vue-chat-scroll'
Vue.use(VueChatScroll)

// Vue.component('example-component', require('./components/ExampleComponent.vue').default);
Vue.component('message-component', require('./components/MessageComponent.vue').default);

const app = new Vue({
    el: '#app',
    data: {
        message: '',
        chat: {
            message: [],
            user: [],
            color: [],
            time: []
        },
        typing:'',
        numberOfUsers: 0
    },
    watch: {
        message() {
            Echo.private('chat')
                .whisper('typing', {
                    name: this.message
                });
        }
    },
    methods: {
        send() {
            if(this.message.length !== 0) {
                this.chat.message.push(this.message);
                this.chat.color.push('success');
                this.chat.user.push('you');
                this.chat.time.push(this.getTime());

                axios.post('/send', {
                    message: this.message
                })
                    .then(response => {
                        console.log(response);
                        this.message = '';
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        },
        getTime() {
            let time = new Date();
            return time.getHours() + ':' + time.getMinutes();
        }
    },
    mounted() {
        Echo.private('chat')
            .listen('ChatEvent', (e) => {
                this.chat.message.push(e.message);
                this.chat.message.push(e.user);
                this.chat.color.push('warning');
                this.chat.time.push(this.getTime());
                // console.log(e);
            })
            .listenForWhisper('typing', (e) => {
                if (e.name !== '') {
                    this.typing = 'typing...'
                } else {
                    this.typing = ''
                }
            });
        Echo.join(`chat`)
            .here((users) => {
                this.numberOfUsers = users.length;
                console.log(users)
            })
            .joining((user) => {
                this.numberOfUsers++;
                // console.log(user.name);
            })
            .leaving((user) => {
                this.numberOfUsers--;
                // console.log(user.name);
            });
    }
});
