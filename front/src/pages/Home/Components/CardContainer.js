import React from "react";
import MyCard from "./MyCard";

export default (props) => {
    const {data} = props;
    return (
        <div style={{flex: 1, padding: '1rem'}}>
            {data && data.map(d => (
                <MyCard key={d.id} title={d.title} icon={d.icon}/>
            ))}
        </div>
    )
};
