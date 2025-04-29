Page({
  data: {
    searchQuery: '',
    terms: [],
    filteredTerms: [],
    expandedTerm: null,
    alphabet: []
  },

  onLoad() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    this.getTerminologies();
  },

  getTerminologies() {
    wx.cloud.callFunction({
      name: 'getTerminologies',
      success: (res) => {
        if (res.result.success) {
          const terms = this.setIcons(res.result.data)
          this.groupByFirstLetter(res.result.data)
          this.generateAlphabet(res.result.data)
          this.setData({
            terms
          })
          wx.hideLoading()
        } else {
          wx.showToast({
            title: '检索失败',
            icon: 'none'
          });
        }
      }
    });
  },

  setIcons(terms) {
    terms = terms.map(term => {
      switch (term.category) {
        case 0:
          term.icon = '/static/images/icons/basic.png';
          break;
        case 1:
          term.icon = '/static/images/icons/wl.png';
          break;
        case 2:
          term.icon = '/static/images/icons/dh.png';
          break;
        case 3:
          term.icon = '/static/images/icons/bike.png';
          break;
        default:
          term.icon = '';
      }
      return term;
    });

    this.setData({
      terms
    });
  },
  generateAlphabet(terms) {
    const alphabetSet = new Set();

    terms.forEach(term => {
      const firstLetter = term.abbreviation.charAt(0).toUpperCase();
      alphabetSet.add(firstLetter);
    });

    this.setData({
      alphabet: Array.from(alphabetSet).sort()
    });
  },

  groupByFirstLetter(terms) {
    const grouped = terms.reduce((acc, term) => {
      const firstLetter = term.abbreviation.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = {
          firstLetter,
          list: []
        };
      }
      acc[firstLetter].list.push(term);
      return acc;
    }, {});

    this.setData({
      filteredTerms: Object.values(grouped).sort((a, b) => a.firstLetter.localeCompare(b.firstLetter))
    });
  }
});