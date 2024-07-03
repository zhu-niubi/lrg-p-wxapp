const formatTime = value => {
  const date = new Date(value  * 1000)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

return `${[year, month, day].map(formatNumber).join('-')}`
//   return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatTimes = value => {
  const date = new Date(value  * 1000)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

// return `${[year, month, day].map(formatNumber).join('-')}`
  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

// 获取当前时间
const NowTime = ()=> {
  var time = new Date();//获取系统当前时间
  var year = time.getFullYear();//获取年
  var month = time.getMonth() + 1;//获取月，由于获取是0-11，所以要+1
  var date = time.getDate();//系统日
  var hour = time.getHours();//获取时
  var minutes = time.getMinutes();//获取分
  var seconds = time.getSeconds();//获取秒
  if (month < 10) {
      month = "0" + month;
  }
  if (date < 10) {
      date = "0" + date;
  }   
if (hour < 10) {
      hour = "0" + hour;
  }  
if (minutes < 10) {
      minutes = "0" + minutes;
  }  
if (seconds < 10) {
      seconds = "0" + seconds;
  }  			
  var newDate = year + "-" + month + "-" + date + " " + hour + ":" + minutes + ":" + seconds;
return newDate;          
}

// 验证手机号
function phoneCheck(countryCode, user) {
  var telStr;
  switch (countryCode) {
    case '+86':

      telStr = /^[1](([3][0-9])|([4][0-9])|([5][0-9])|([6][0-9])|([7][0-9])|([8][0-9])|([9][0-9]))[0-9]{8}$/

      return telStr.test(user);

    case '+886':

      telStr = /^[09]\d{8}$/;

      return telStr.test(user);

    case '+852':

      telStr = /^[5|6|9]\d{7}$/;

      return telStr.test(user);

    default:

      return /\D/g.test(user) ? false : true;

  }
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime,
  phoneCheck,
  NowTime,
  formatTimes
}
