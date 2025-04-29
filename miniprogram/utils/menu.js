export function generateMenu() {
  const venueOption = [{
    text: '全部',
    value: 0
  },{
    text: 'CrossFit',
    value: 1
  },{
    text: 'Hyrox',
    value: 2
  }]

  const classOption = [
    { text: '早课', value: 'early' },
    { text: '举重专项课', value: 'weightlifting' },
    { text: '体操专项课', value: 'gymnastics' },
    { text: '运动表现课', value: 'performance' },
    { text: '瑜伽课', value: 'yoga' }
  ];

  return {
    venueOption,
    classOption
  };
}