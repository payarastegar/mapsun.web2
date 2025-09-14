import React, { useEffect, useState } from "react";
// import html from "./ProjectDashboard.html";

function ProjectDashboardFieldInfo() {
  const [html, setHtml] = useState("");

  useEffect(() => {
    fetch("/page.html")
      .then((res) => res.text())
      .then((text) => setHtml(text));
  }, []);

  return (
    <iframe srcDoc={html} title="Embedded Page" width="1200px" height="800px" />
  );
}

export default ProjectDashboardFieldInfo;
