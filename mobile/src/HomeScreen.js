import React, { useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import ActivityCards from "./ActivityCards";
import ActivityForm from "./ActivityForm";
import { Input, Text, Button, Badge } from "@rneui/themed";
import {
  getGoogleAuthorisation,
  getPublishStatus,
  saveGoogleAuthorisation,
} from "../storage";

WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen({ navigation }) {
  const [homeAddress, setHomeAddress] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isGoogleAuthorised, setIsGoogleAuthorised] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      "449233078289-hkr95dfmou01itchchh1baj1sllmco4p.apps.googleusercontent.com",
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      saveGoogleAuthorisation(response);
    }
  }, [response]);

  useEffect(() => {
    const fetchPublishStatus = async () => {
      const isPublished = await getPublishStatus();
      setIsPublished(isPublished);
    };
    fetchPublishStatus();
  }, []);

  useEffect(() => {
    const fetchGoogleAuth = async () => {
      const authorisation = await getGoogleAuthorisation();

      if (authorisation) {
        const expiresIn = new Date(
          authorisation.authentication.issuedAt +
            Number(authorisation.authentication.expiresIn)
        );
        const now = new Date();
        console.log(expiresIn, now);
        if (now > expiresIn) {
          setIsGoogleAuthorised(true);
        }
      }
    };
    fetchGoogleAuth();
  }, []);

  return (
    <View style={styles.container}>
      <View>
        <Text h2>Welcome to home!</Text>
        {isGoogleAuthorised ? (
          <Badge value="Google Account is Authorised" color="primary" />
        ) : (
          <Button
            disabled={!request}
            onPress={() => {
              promptAsync();
            }}
          >
            Authorise Google Calendar
          </Button>
        )}
      </View>
      <Input
        placeholder={"Type you home address here"}
        value={homeAddress}
        onChange={setHomeAddress}
      />
      {isPublished ? <ActivityCards /> : <ActivityForm />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});
