import React, { Component } from "react";
import "./MapFieldInfo.css";
import Utils from "../../Utils";
import MapFieldInfo_Core from "./MapFieldInfo_Core";

import NeshanMap from "./NeshanMap";
import UiSetting from "../../UiSetting";

class MapFieldInfo extends MapFieldInfo_Core {
  //------------------------------------------------
  //region component public method
  //------------------------------------------------

  componentDidMount() {
    //comment
  }

  componentWillUnmount() {
    //comment
  }

  //------------------------------------------------
  //endregion component public method
  //------------------------------------------------

  //------------------------------------------------
  //region render
  //------------------------------------------------
  serverName = UiSetting.serverName;

  neshanMap_Init(L, myMap) {
    this.dataSource = this._dataGetDataSource();
    let mapData = this.dataSource.dataArray;
    let latLong_FieldName = this.fieldInfo["map_LatLong_FieldName"];
    let locationName_FieldName = this.fieldInfo["map_LocationName_FieldName"];
    let hazine_FieldName = this.fieldInfo["map_Hazine_FieldName"];
    let daramad_FieldName = this.fieldInfo["map_Daramad_FieldName"];
    let tooltip_FieldName = this.fieldInfo["map_Tooltip_FieldName"];
    let circleRadius_Default = this.fieldInfo["map_CircleRadius_Default"];

    if (!latLong_FieldName) {
      console.log("80010- فیلد لت و لانگ مشخص نشده است");
      return;
    }

    if (!mapData || !mapData.length || mapData.length === 0) return;

    mapData.map((locationRecord, index) => {
      if (
        locationRecord[latLong_FieldName] &&
        locationRecord[latLong_FieldName].length > 0
      ) {
        let locationName = locationRecord[locationName_FieldName];
        let popupHtml = "";
        if (1 == 0) {
          // فعلا پاپ آپ روی کلیک روی آیتم های نقشه نداریم
          popupHtml = `<div style='width:100px;height:100px;'>
              <div style='width:50px;height:10px;background-color:red;'>
              </div>
              <b>
                ${locationName}
              </b>
              <br>I am a popup.
            </div>`;
        }
        let hazine = locationRecord[hazine_FieldName] || 0;
        let daramad = locationRecord[daramad_FieldName] || 0;
        let maxHazine_Daramad = Math.max(hazine, daramad);
        let circleRadius = circleRadius_Default;
        let circleColor = "ffff00"; //
        let ratio_ByTwo = -1; // نسبت درآمد * 2 تقسیم بر هزینه + درآمد
        let tooltipHtml = locationRecord[tooltip_FieldName].replace(
          /!@#/g,
          "<br>"
        ); // "<div>" + locationName + "</div>";

        if (maxHazine_Daramad > 0) {
          circleRadius += Math.log10(maxHazine_Daramad / 10000000) * 100;
          ratio_ByTwo = (daramad * 2) / (hazine + daramad); //عددی بین 0 تا 2

          if (ratio_ByTwo <= 1)
            circleColor = Utils.color_MixTwoColors(
              "#ff0000",
              "#0000ff",
              ratio_ByTwo
            );
          else
            circleColor = Utils.color_MixTwoColors(
              "#0000ff",
              "#00ff00",
              ratio_ByTwo - 1
            );
        }

        L.circle(
          Utils.latLong_GetArrayFromText(locationRecord[latLong_FieldName]),
          {
            color: circleColor, // "red",
            fillColor: circleColor, // "#f03",
            fillOpacity: 0.5,
            radius: circleRadius,
          }
        )
          .addTo(myMap)
          .bindTooltip(tooltipHtml);
        //.bindPopup(popupHtml);
      }
    });
  }
  render() {
    if (this.serverName !== "Mapsun") return null;
    else {
      return (
        <NeshanMap
          options={{
            key: "web.186e181efbfa42398a3c7f8e193608a6",
            maptype: "dreamy-gold",
            poi: true,
            traffic: false,
            center: [36.321772187906426, 59.56196717673425],
            zoom: 12,
          }}
          onInit={this.neshanMap_Init.bind(this)}
        />
      );
    }
  }

  //------------------------------------------------
  //endregion render
  //------------------------------------------------
}

export default MapFieldInfo;

//80011
