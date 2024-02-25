/************
* This fiddle uses amazon cognito identity SDK
* https://github.com/aws-amplify/amplify-js/tree/master/packages/amazon-cognito-identity-js
*************/

/************ Configure user pool and client*/

// cognito 관련 설정을 넣어야 한다.
var poolData = {
  UserPoolId: "", // Your user pool id here
  ClientId: ""
};
var testAPIURL = "http://localhost:9000/profile";

// const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
//   region: 'us-east-1', // 사용자 풀이 위치한 리전
//   apiVersion: '2016-04-18'
// });

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
var cognitoUser;
  
  /************ sign up*/
  async function signUp(){
  
      var email = $("#signup_email").val();
      var username = $("#signup_username").val();
      var password = $("#signup_password").val();
      var name = $("#signup_name").val();
      var phone = $("#signup_phone").val();
   
      var attributeList = [];
  
      var dataEmail = { Name: 'email', Value: email };
      var dataPhone = {Name: 'phone_number', Value: phone };
      var dataName = {Name: 'name', Value: name};
      
      var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
      var attributeName = new AmazonCognitoIdentity.CognitoUserAttribute(dataName);
      var attributePhone = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhone);
  
      attributeList.push(attributeEmail);
      attributeList.push(attributeName);
      attributeList.push(attributePhone);
      
      userPool.signUp(username, password, attributeList, null, async function (err, result ) {
        if (err) {
          console.log(err.message || JSON.stringify(err));
          return;
        }else{
            console.log("Success:"+result);
            var cognitoUser = result.user;
          //   var updateUserAttributes = { 
          //     UserPoolId: poolData.UserPoolId, 
          //     Username: username, 
          //     UserAttributes: [ 
          //     { 
          //         Name: "email_verified", 
          //         Value: "true",
          //     },
          //     ],
              
          // };
          // console.log(updateUserAttributes);
          // await cognitoIdentityServiceProvider.adminUpdateUserAttributes(updateUserAttributes);
          var cognitoUser = result.user;
          var confirmationCode = prompt("Please enter confirmation code:");
          
          cognitoUser.confirmRegistration(confirmationCode, true, function(err, result) {
            if (err) {
              alert(err.message || JSON.stringify(err));
              return;
            }
            console.log('call result: ' + result);
          });
        }
      });
  }
  
  /************ sign in*/
  function signIn(){
  
      var username = $("#signin_username").val();
      var password = $("#signin_password").val();
  
      var authenticationData = {
        Username: username,
        Password: password
      };
      
      var userData = {
        Username: username,
        Pool: userPool,
      };
  
      var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
        authenticationData
      );
  
      console.log("--------Authenticate --- "+username+", UserPool:"+userPool);
      
      cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
      
      //cognitoUser.setAuthenticationFlowType('CUSTOM_AUTH');
      
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function(result) {
            var idToken = result.getIdToken().getJwtToken();
          var accessToken = result.getAccessToken().getJwtToken();
          
          $("#idToken").html('<b>ID Token</b><br>'+JSON.stringify(parseJwt(idToken),null, 2));
                  $("#accessToken").html('<b>Access Token</b><br>'+JSON.stringify(parseJwt(accessToken), null, 2));
          console.log("AccessToken:"+accessToken);
        },
  
        onFailure: function(err) {
          alert(err.message || JSON.stringify(err));
        },
  
        totpRequired: function(codeDeliveryDetails) {
            console.log("mfaRequired");
            console.log(codeDeliveryDetails);
          var verificationCode = prompt('Please input second factor code', '');
          cognitoUser.sendMFACode(verificationCode, this, 'SOFTWARE_TOKEN_MFA');
        },
      });
  }
  
  /****************signOut**************/
  function signOut(){
    cognitoUser.signOut();
    $("#idToken").html('');
    $("#accessToken").html('');
    $("#apiresponse").html('');
  }
  
  /******************************** enable MFA
  * MAKE SUTE TOTP MFA IS ENABLED IN USER POOL
  ********************************************/
  // function enableMFA(){
  
  //   console.log("--------Start TOTP MFA Setup");
  //   cognitoUser.associateSoftwareToken({
  //     onSuccess: function(result) {
  //       console.log(result);
  //     },
  //     associateSecretCode: function(secretCode) {
  //       console.log("MFASecretCode:"+secretCode);
  
  //       var canvas = document.getElementById('qrcanvas');
  //       var tokenObj = cognitoUser.signInUserSession.idToken.payload;
  //       var totpUri = "otpauth://totp/MFA:"+ tokenObj["email"] +"?secret="+ secretCode +"&issuer=CognitoJSPOC";
  //       console.log(totpUri);
  
  //       var qrcode = new QRCode(document.getElementById("qrcode"), {
  //         text: totpUri,
  //         width: 128,
  //         height: 128,
  //         colorDark : "#000000",
  //         colorLight : "#ffffff",
  //         correctLevel : QRCode.CorrectLevel.H
  //       });
        
  //       var totpCode = prompt("Enter software token code");
  //       cognitoUser.verifySoftwareToken(totpCode, 'SoftwareToken',{
  //         onSuccess: function(result) {
  //           console.log(result);
  
  //           totpMfaSettings = {
  //             PreferredMfa : true,
  //             Enabled : true
  //           };
  //           cognitoUser.setUserMfaPreference(null, totpMfaSettings, function(err, result) {
  //             if (err) {
  //               alert(err);
  //             }
  //             console.log('setUserMfaPreference call result ' + result)
  //           });
  //         },
  
  //         onFailure: function(err) {
  //           console.log(err);
  //         }
  //       });
  
  //     },
  
  //     onFailure: function(err) {
  //       console.log(err);
  //     }
  //   });
  // }
  
  /************ disable MFA*/
  // function disableMFA(){
  
  //   var mfaSettings = {
  //     PreferredMfa : false,
  //     Enabled : false
  //   };
  
  //   cognitoUser.setUserMfaPreference(mfaSettings, mfaSettings, function(err, result) {
  //     if (err) {
  //       console.error(err);
  //     }
  //     console.log('clear MFA call result ' + result);
  //   });
  // }
  
  /************ call protected APIGW endpoint
  *MAKE SURE APIGW COGNITO AUTHORIZER CONFIGURATION IS COMPLE
  *MAKE SURE API ACCEPTS ID-TOKEN (NO OAUTH SCOPE DEFINED IN AUTHORIZATION)
  *YOU CAN ONLY USE ID-TOKEN SINCE CUSTOM SCOPES ARE NOT SUPPORTED WHEN SDK IS USED
  ******************************************/
  function callAPIWithAuth(){
  
    apiGatewayUrl = testAPIURL;
  
    // set ID Token in "Authorization" header
    const headers = { 
        'Content-Type': 'application/json', 
        'Authorization': cognitoUser.signInUserSession.idToken.jwtToken
    }
  
    axios.get(apiGatewayUrl, { headers: headers }).then((response) => {
      console.log(response.data);
      $("#apiresponseWithAuth").html('<b>Response</b><br>'+JSON.stringify(response.data,null, 2));
    }).catch(function (error) {
      console.error(error);
    });
  
  }

  function callAPI(){
  
    apiGatewayUrl = testAPIURL;
  
    // set ID Token in "Authorization" header
    const headers = { 
        'Content-Type': 'application/json', 
        'Authorization': ''
    }
  
    axios.get(apiGatewayUrl, { headers: headers }).then((response) => {
      console.log(response.data);
      $("#apiresponse").html('<b>Response</b><br>'+JSON.stringify(response.data,null, 2));
    }).catch(function (error) {
      $("#apiresponse").html('<b>Response</b><br>'+JSON.stringify(error,null, 2));
      console.error(error);
    });
  
  }
  
  /************ list files in S3 bucket
  *PREREQUISITES
  *1. IDENTITY POOL CREATED AND CONFIGURED TO USE USER POOL AS IDP
  *2. PERMISSIONS DEFINED ON THE IAM ROLE TO ALLOW S3 LIST
  *3. BUCKET CREATED WITH PROPER X-ORIGIN POLICY TO ALLOW CALLS
  */
  function listFiles(){
  
      $("#s3files").html('');
  
    AWS.config.region = 'us-west-2';
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-west-2:b6277d0a-826e-411a-abce-b98040e43d79',
        Logins: {
            'cognito-idp.us-west-2.amazonaws.com/us-west-2_Z06eVkRDc': cognitoUser.signInUserSession.idToken.jwtToken
        }
    });
  
    // Make the call to obtain credentials
    AWS.config.credentials.get(function(){
  
      // Credentials will be available when this function is called.
      var accessKeyId = AWS.config.credentials.accessKeyId;
      var secretAccessKey = AWS.config.credentials.secretAccessKey;
      var sessionToken = AWS.config.credentials.sessionToken;
  
      var s3 = new AWS.S3();
      var params = {
          Bucket: $("#bucket_name").val(),
        Prefix: $("#prefix").val()
       };
      s3.listObjects(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else{
          $("#s3files").html('<b>Response</b><br>'+JSON.stringify(data.Contents,['Key'], 2)); // successful response
        }
      });
    });
  }
  
  
  /******************helpers*/
  function openTab(tabName) {
    var i;
    var x = document.getElementsByClassName("tab");
    for (i = 0; i < x.length; i++) {
      x[i].style.display = "none";  
    }
    document.getElementById(tabName).style.display = "block";
  }
  
  function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  };