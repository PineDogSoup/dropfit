import {
  generateTagList
}
from "../../utils/venues.js"

Component({
  properties: {
    liked: false,
    info: {
      type: Object,
      value: null,
      observer(newVal) {
        // console.log('newVal', newVal);
        const detail = newVal.detail[0]
        if (detail && detail.images) {
          this.processImages(detail.images);
        }
        this.setData({
          detail,
          venueId: newVal._id,
          distance: newVal.distance
        })
      }
    }
  },
  data: {
    showImages: false,
    processedImages: [],
    tags: [],
    venueId: ''
  },
  lifetimes: {
    attached() {
      this.initTags();
    }
  },
  methods: {
    processImages(images) {
      const processedImages = [];
      const length = images.length;

      for (let i = 0; i < 3; i++) {
        processedImages.push(images[i % length]);
      }
      this.setData({
        processedImages
      });
    },
    initTags() {
      const venueTags = this.properties.info.tags ? this.properties.info.tags[0] : [];
      const tags = generateTagList(venueTags)
      this.setData({
        tags
      });
    }
  }
});