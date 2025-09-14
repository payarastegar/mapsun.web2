import React from "react";

export default (props) => {
    const {title, icon} = props;
    return (
        <div className="Card">

            <div>
                <img className="Card_img" src={icon}/>
            </div>

            <div style={{marginRight: '1rem'}}>
                <div>
                    <div>
                        {title}
                    </div>
                </div>
                <div className="Card_more">
                    <a  style={{color:'#ff600a'}} href="#">بیشتر</a>
                </div>
            </div>

        </div>
    )
};
