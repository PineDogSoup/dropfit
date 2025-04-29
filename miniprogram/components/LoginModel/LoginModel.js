Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
    message: {
      type: String,
      value: '「DropFit途健」需要获取您的手机号,以便为您提供更好的服务',
    },
  },
  methods: {
    onLogin(e) {
      console.log('getPhoneNumber event:', e);
      const {
        code,
        errMsg,
      } = e.detail;
      this.triggerEvent('login', {
        code,
        errMsg
      });
    },
    onCancel() {
      this.triggerEvent('cancel');
    },
  },
});