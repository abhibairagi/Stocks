const express = require('express')
const axios = require('axios')
const moment = require('moment');
var CronJob = require('cron').CronJob;
const fs = require('fs');

const totp = require("totp-generator");

var token = totp("BNKMA6H57UAJQFJ4RUQ2LO4WEQ");

var CLientCode = 'P233917';
var Password = "4567";

var BearerToken ;
var getltpValue; 
var EMAValue; 
var PreviousEMAValue; 

//Storing High and Low 
var CandleHigh; 
var CandleLow;
var CandleClose; 

// Check Distance for EMA 
var DistanceEma ; 


//Login Functionality
function getToken() {
  var data = JSON.stringify({
    "clientcode": CLientCode,
    "password": Password,
    "totp": token
  });

  var config = {
    method: 'post',
    url: 'https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword',

    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-UserType': 'USER',
      'X-SourceID': 'WEB',
      'X-ClientLocalIP': 'CLIENT_LOCAL_IP',
      'X-ClientPublicIP': 'CLIENT_PUBLIC_IP',
      'X-MACAddress': 'MAC_ADDRESS',
      'X-PrivateKey': 'mFm0FaBD'
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      BearerToken = response.data.data.jwtToken
      console.log(BearerToken, "Hello")
    })
    .catch(function (error) {
      console.log(error);
    });

}


const TokenGenerate = new CronJob('44 07 * * *', function() {
  getToken();
});

TokenGenerate.start();



function RunningAlgo() {
  var EMA_checker = setInterval(() => {
  //  console.log("Hits here")
    // console.log(mom)
    var data = JSON.stringify({
      "exchange": "NFO",
      "symboltoken": "36185",
      "interval": "FIVE_MINUTE",
      "fromdate": moment(Date.now()).add(85, 'minutes').format('YYYY-MM-DD kk:mm'),
      "todate": moment(Date.now()).add(89, 'minutes').format('YYYY-MM-DD kk:mm')
    });

//     console.log(data, "Data")
  
    var config = {
      method: 'post',
      url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/historical/v1/getCandleData',
  
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB',
        'X-ClientLocalIP': 'CLIENT_LOCAL_IP',
        'X-ClientPublicIP': 'CLIENT_PUBLIC_IP',
        'X-MACAddress': 'MAC_ADDRESS',
        'X-PrivateKey': 'mFm0FaBD', 
        'Authorization' : `Bearer ${BearerToken}`
      },
      data: data
    };
  // console.log(config, "Config")
    axios(config)
      .then(function (response) {
        console.log(response.data, "Data")
        var tempStorage = response.data.data[0]
        CandleHigh = tempStorage[2]
        CandleLow = tempStorage[3]
        CandleClose = tempStorage[4]

        // GetEMAValue
         PreviousEMAValue = 43387.32

         EMAValue = Number((CandleClose - PreviousEMAValue) * (2 / (5 + 1)) + PreviousEMAValue).toFixed(2)
        //  console.log(EMAValue, "EMAValue")
        //  console.log(CandleLow, "CandleLow")
         PreviousEMAValue = EMAValue

         DistanceEma = Number(CandleLow - EMAValue).toFixed(2)
        if(CandleHigh - CandleLow < 60  &&  EMAValue < CandleLow && DistanceEma > 5) {

          setInterval(() => {
            setTimeout(() => {
              getltpValue =  getRealData()
            }, 1000);

            if(getltpValue < CandleLow) {

             UpdateLogs( getltpValue + " " + CandleLow + " Order Trigger" )

            }
            
          }, 2000);

        } else {
          const message = CandleClose + " " + EMAValue + "Condition Not Satisfy"

          UpdateLogs(message)
        }




        //Check Now 5EMA and Low of Candle
        // if()

        
         
      })
      .catch(function (error) {
        console.log(error);
      });
  
  }, (5 * 60 * 1000) + 800);
}

// RunningAlgo();

// getting Real time Data
function getRealData() {
  var data = JSON.stringify({
    "exchange":"NFO",
    "tradingsymbol":"BANKNIFTY",
    "symboltoken":"36185"
  });

  var config = {
    method: 'post',
    url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/getLtpData',

    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-UserType': 'USER',
      'X-SourceID': 'WEB',
      'X-ClientLocalIP': 'CLIENT_LOCAL_IP',
      'X-ClientPublicIP': 'CLIENT_PUBLIC_IP',
      'X-MACAddress': 'MAC_ADDRESS',
      'X-PrivateKey': 'mFm0FaBD', 
      'Authorization' : `Bearer ${BearerToken}`
    },
    data: data
  };
// console.log(config)
  axios(config)
    .then(function (response) {
      return response.data.data.ltp
      //  console.log(response.data.data.ltp, "getRealData")
    })
    .catch(function (error) {
      console.log(error);
    });
}

// getRealData()

// Cron Job

const RunAlgo = new CronJob('45 07 * * *', function() {
    UpdateLogs('Algo Started')
    RunningAlgo()

});


RunAlgo.start();


function UpdateLogs(message) {
  var logMessage =   moment(Date.now()).format('YYYY-MM-DD kk:mm') + " " + message
  const logFilePath = './logs.txt';
  fs.appendFile(logFilePath, logMessage + '\n', (err) => {
    if (err) {
      console.error(err);
    } else {
    }
  });
}


// console.log("Server Running")
// const endCron = new CronJob('46 15 * * *', function() {
//   console.log('End Cron JOb Here' , moment(Date.now()).format('YYYY-MM-DD kk:mm'))

//   TimerJob.stop();
// });

// endCron.start(); 

// console.log((42907.20 - 42891.40) * (2 / (5 + 1)) + 42891.40)  

// EMA  formula
// (Current Price - Previous EMA) * (2 / (n + 1)) + Previous EMA


//How to Make Number Round 

// let num = 12345;
// let roundedNum = Math.floor(num/100)*100;
// console.log(roundedNum);

// const acb = Number(( 43417.70- 43433.61 ) * (2 / (5 + 1)) + 43433.61 ).toFixed(2)
// console.log(acb)
