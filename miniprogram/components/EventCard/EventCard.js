
import {
  formatTimestampDate
} from "../../utils/common.js"

Component({
  properties: {
    data: {
      type: Object,
      value: {},
      observer(newVal) {
       var date =  formatTimestampDate(newVal.eventDate)
        const [year, day, month] = date.split('/');
        if (day != '') {
          this.setData({
            day,
            month
          });
        }

        let statusColor = '';
        switch (newVal.status) {
          case '未开始':
            statusColor = 'gray';
            break;
          case '进行中':
            statusColor = '#ff165d';
            break;
          case '报名中':
            statusColor = '#f07b3f';
            break;
          case '已结束':
            statusColor = 'green';
            break;
          default:
            statusColor = 'black';
        }
        this.setData({
          statusColor
        });
      }
    }
  },
  data: {
    day: '',
    month: '',
    statusColor: '',
  },
  methods: {}
});