import React from "react";
import mapsun from "../../../content/front/mapsun-logo.png"

export default () => {
    return (
        <nav className="NavHeader">
            <div className="NavHeader__container">

                <img className="NavHeader__logo" src={mapsun} width={80}/>

                <div className="NavHeader__linkContainer">
                    <ul className="NavHeader__linkUl">
                        <a className="NavHeader__link" href="#"> درباره ما </a>
                        <a className="NavHeader__link" href="#"> بلاگ </a>
                        <a className="NavHeader__link" href="#"> قیمت </a>
                        <a className="NavHeader__link" href="#">امکانات </a>
                    </ul>
                </div>

                <div style={{flex: 1, textAlign: 'right'}}>
                </div>

                <a className="NavHeader__link" href="/auth/login">ورود</a>

                <button style={{fontSize: '1rem'}} className="MyButton">
                    درخواست دمو
                </button>
            </div>


        </nav>
    )
};
