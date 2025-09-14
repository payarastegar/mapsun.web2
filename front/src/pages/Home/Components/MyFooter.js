import React from "react";
import telegramSrc from "../../../content/front/mapsun-logo.png"
import instagramSrc from "../../../content/front/instagram.png"
import linkedinSrc from "../../../content/front/linkedin.png"
import whatsappSrc from "../../../content/front/whatsapp.png"

export default () => {
    return (
        <div className="MyFooter">
            <div className="MyFooter__phoneContainer" style={{textAlign: 'center', color: '#ffffff'}}>
                <h4>
                    تماس با ما
                </h4>
                <div style={{marginTop: '1rem'}} className="MyFooter__phone">
                    ۰۹۱۵ ۱۰۳ ۶۸۳۳
                </div>

                <div style={{minHeight: '1rem'}}></div>

                <div className="MyFooter__phone">
                    ۰۵۱ ۳۸۴۷ ۵۲۶۳
                </div>

                <div className="MyFooter__phone">
                    ۰۵۱ ۳۸۴۷ ۵۲۶۴
                </div>

                <div className="MyFooter__phone">
                    ۰۵۱ ۳۸۴۷ ۵۷۱۹
                </div>

            </div>

            <div className="MyFooter__phoneContainer" style={{textAlign: 'center', color: '#ffffff', flex: 1}}>

                <div className="MyFooter__phone">
                    <a className="NavHeader__link NavHeader__link--footer" href="#">امکانات </a>
                </div>

                <div style={{marginTop: '1rem'}} className="MyFooter__phone">
                    <a className="NavHeader__link NavHeader__link--footer" href="#">بلاگ </a>
                </div>

                <div style={{marginTop: '1rem'}} className="MyFooter__phone">
                    <a className="NavHeader__link NavHeader__link--footer" href="#">قیمت </a>
                </div>
                <div style={{marginTop: '1rem'}} className="MyFooter__phone">
                    <a className="NavHeader__link NavHeader__link--footer" href="#">امکانات </a>
                </div>

            </div>
            <div className="MyFooter__phoneContainer" style={{textAlign: 'center', color: '#ffffff'}}>
                <h6>
                    ... ما را در شبکه های اجتماعی دنبال کنید
                </h6>

                <div style={{margin: "16px 0", height: "1px", backgroundColor: "white"}}></div>

                <div className="MyFooter__imgContainer">

                    <div className="MyFooter__phone">
                        <img src={telegramSrc} className="MyFooter__img"/>
                    </div>

                    <div className="MyFooter__phone">
                        <img src={whatsappSrc} className="MyFooter__img"/>
                    </div>

                    <div className="MyFooter__phone">
                        <img src={linkedinSrc} className="MyFooter__img"/>
                    </div>

                    <div className="MyFooter__phone">
                        <img src={instagramSrc} className="MyFooter__img"/>
                    </div>

                </div>

            </div>
        </div>
    )

};
