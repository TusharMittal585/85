import React,{Component} from 'react'
import { View,Text,TouchableOpacity } from 'react-native' 
import * as Google from "expo-google-app-auth";
import firebase from 'firebase' 

export default class LoginScreen extends React.Component{
   isUserEqual = (googleUser, firebaseUser) => {
    if (firebaseUser) {
      var providerData = firebaseUser.providerData;
      for (var i = 0; i < providerData.length; i++) {
        if (
          providerData[i].providerId ===
          firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()
        ) {
         
          return true;
        }
      }
    }
    return false;
  };
   onSignIn = googleUser => {
    
    var unsubscribe = firebase.auth().onAuthStateChanged(firebaseUser => {
      unsubscribe();
      
      if (!this.isUserEqual(googleUser, firebaseUser)) {
       
        var credential = firebase.auth.GoogleAuthProvider.credential(
          googleUser.idToken,
          googleUser.accessToken
        );

       
        firebase
          .auth()
          .signInWithCredential(credential)
          .then(function (result) {
            if (result.additionalUserInfo.isNewUser) {
              firebase
                .database()
                .ref("/users/" + result.user.uid)
                .set({
                  gmail: result.user.email,
                  profile_picture: result.additionalUserInfo.profile.picture,
                  locale: result.additionalUserInfo.profile.locale,
                  first_name: result.additionalUserInfo.profile.given_name,
                  last_name: result.additionalUserInfo.profile.family_name,
                  current_theme: "dark"
                })
                .then(function (snapshot) { });
            }
          })
          .catch(error => {
            
            var errorCode = error.code;
            var errorMessage = error.message;
           
            var email = error.email;
         
            var credential = error.credential;
        
          });
      } else {
        console.log("User already signed-in Firebase.");
      }
    });
  };
   signInWithGoogleAsync = async () => {
      const result = await Google.logInAsync({
        behaviour: "web",
        androidClientId:
          "891447745747-477pnmv25kb8jvl7h5k65h4jl9g99q60.apps.googleusercontent.com",
        iosClientId:
          "891447745747-05c2a5ggd4snhnee2uob1912eclepr6i.apps.googleusercontent.com",
        scopes: ["profile", "email"]
      });
    
  }
  render(){
    return(
      <TouchableOpacity onPress={()=>{this.signInWithGoogleAsync()}}>
      <View style={{
        flex:1,
        justifyContent:'center',
        alignItems:'center' }}
        >
         <Text>Sign In With Google</Text>
        </View>
        </TouchableOpacity> 
     
    )
  }
}