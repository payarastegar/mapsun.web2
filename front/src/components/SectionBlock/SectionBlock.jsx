import React from "react";

import "./SectionBlock.css";

function SectionBlock({ style, children, item_definition, dashboardButtons, fieldInfo = null }) {
  const isSingleLayout = item_definition && item_definition.layout === "single";

  const shouldShowChartTitle = 
    isSingleLayout && 
    item_definition &&
    item_definition.chart_TitleLocationName && 
    fieldInfo;


  const titleClassName = shouldShowChartTitle ? `chart-title title-${item_definition.chart_TitleLocationName.toLowerCase()}` : "";

  return (
    <div style={style} className="section-block-container">
      {shouldShowChartTitle && (
        <div className={titleClassName}>
          {fieldInfo.label}
        </div>
      )}

      {children}
      
      {isSingleLayout && dashboardButtons && (
        <div className="btn-dashboard-container">
          {dashboardButtons}
        </div>
      )}
    </div>
  );
}

export default SectionBlock;