import { isLocalInternet_Front } from "../../UiSetting"; 

const NESHAN_CSS_URL = "https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.css";
const NESHAN_JS_URL = "https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js";

export default (props) => {
  if (isLocalInternet_Front) {
    console.log("Local internet detected. Skipping Neshan Map loading.");
    return;
  }

  const { onError, onLoad } = props;

  if (document.getElementById("neshan-map-script")) {
    if (onLoad) onLoad();
    return;
  }

  const link = document.createElement("link");
  link.id = "neshan-map-style";
  link.rel = "stylesheet";
  link.href = NESHAN_CSS_URL;
  document.head.appendChild(link);

  const script = document.createElement("script");
  script.id = "neshan-map-script";
  script.src = NESHAN_JS_URL;

  script.onload = () => {
    if (onLoad) onLoad();
  };

  script.onerror = () => {
    if (onError) onError();
  };

  document.body.appendChild(script);
};