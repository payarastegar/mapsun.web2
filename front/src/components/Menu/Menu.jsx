import React, { Fragment } from "react";
import { Button, UncontrolledTooltip } from "reactstrap";
import LoginLogo from "../../content/first-page-logo.jpg";
import LoginLogo2 from "../../content/ok logo.png";
import "./Menu.css";
import BaseComponent from "../BaseComponent";
import SystemClass from "../../SystemClass";
import FontAwesome from "react-fontawesome";
import * as ReactDOM from "react-dom";
import ConnectionStatus from "../ConnectionStatus/ConnectionStatus";
import ProgressBar from "../ProgressBar/ProgressBar";
import { Popup } from "semantic-ui-react";
import WebService from "../../WebService";
import UiSetting from "../../UiSetting";
import { Translation } from "react-i18next";

class Menu extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      openMenu1: false,
      openMenu100: false,
    };

    this.data = {
      needUpdateMenuSize: true,
      maxMenuItemInMenuBar: -1,
      activeMenuItems: [],
      mainMenu: null,
    };

    SystemClass.MenuComponent = this;

    if (!WebService.getUserInfo().login) {
      // const url = SystemClass.browserHistory.location.pathname

      // if (!SystemClass.browserHistory.location.pathname.startsWith('/auth')) {
      SystemClass.handleUnauthorizeError();
      // }
    }

    this.initialize();

    this.getInitialDataSources();
  }

  initialize = () => {
    this.MainMenu = this.data.mainMenu || { menuItem_Array: [] };

    if (!this.MainMenu.menuItem_Array) return;

    this.MainMenu.menuItem_Array.sort((itemA, itemB) => {
      return itemA.menuItem_Tartib > itemB.menuItem_Tartib
        ? 1
        : itemA.menuItem_Tartib < itemB.menuItem_Tartib
        ? -1
        : 0;
    });
    this.data.needUpdateMenuSize = true;

    this.data.userImage = SystemClass.getLastUserImage();

    this.align = UiSetting.GetSetting("textAlign");

    // if (!this._getUserInits() && !this.MainMenu.userImage) {
    //     this.data.userImage = SystemClass.getLastUserImage() || defaultUserImage
    // }
  };

  updateImage = () => {
    this.data.userImage = SystemClass.getLastUserImage();
    this.forceUpdate();
  };

  update = () => {
    this.initialize();
    this.closeAllMenu();
  };

  closeAllMenu = () => {
    Object.keys(this.state).forEach((key) => {
      if (key.startsWith("openMenu")) {
        this.state[key] = false;
      }
    });
    this.forceUpdate();
  };

  getInitialDataSources = async () => {
    // this._setLoading(true)
    this.state.loaded = false;

    //get
    // const menuDataSource = new WebService('Forms/getForm', {
    //     formId: 457,
    //     paramList: {formParams: {tblFormInfoId: 457}}
    // })

    let menuDataSource;
    if (SystemClass.MainMenuData) {
      menuDataSource = new Promise((resolve) =>
        resolve(SystemClass.MainMenuData)
      );
    } else {
      menuDataSource = new WebService(WebService.URL.webService_Menu, {
        paramList: {},
      });
    }

    menuDataSource.then((json) => {
      if (json.menuItem_Array) {
        this.data.mainMenu = json;
        SystemClass.MenuComponent && SystemClass.menuUpdate();
      }
    });

    await SystemClass.setLoading(true);
    const self = this;
    Promise.all([menuDataSource]).finally(() => {
      // setTimeout(this._setLoading, 100)
      // SystemClass.setLoading(false)
      this.state.loaded = true;
      SystemClass.setLoading(false);
      SystemClass.AppComponent && SystemClass.AppComponent.update();
      self.forceUpdate();
    });
  };

  componentDidMount() {
    window.addEventListener("resize", this._handleWindowResize);
    window.addEventListener("online", this._handleWindowUpdateOnlineStatus);
    window.addEventListener("offline", this._handleWindowUpdateOnlineStatus);
    this.data.node = ReactDOM.findDOMNode(this);
    this.data.nodeJaneshin = this.data.node.querySelector(
      "#MenuItem__Janeshin"
    );

    this.forceUpdate();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._handleWindowResize);
    window.removeEventListener("online", this._handleWindowUpdateOnlineStatus);
    window.removeEventListener("offline", this._handleWindowUpdateOnlineStatus);
  }

  // region others

  _getUserInits() {
    const username = window.sessionStorage.userDisplayName;
    if (!username || this.MainMenu.userInitials)
      return this.MainMenu.userInitials;

    const splitedUserName = username.split(/[ ]|-/);
    let inits = splitedUserName[0] && splitedUserName[0][0];
    inits += splitedUserName[1] && splitedUserName[1][0];
    return inits;
  }

  _menuItemIsOpen(tblMenuItemId) {
    return this.state["openMenu" + tblMenuItemId];
  }

  _updateActiveMenuItems = () => {
    let currentUrl = SystemClass.browserHistory.location.pathname;

    let menuItem;
    let menuItems;
    let property = "menuItem_FormCid";
    if (currentUrl.indexOf("frame") !== -1) {
      property = "menuItem_Frame_Url";
      menuItem = this.MainMenu.menuItem_Array.find(
        (item) => item[property] && currentUrl.indexOf(item[property]) !== -1
      );
    } else {
      menuItem = this.MainMenu.menuItem_Array.find(
        (item) =>
          item[property] !== undefined && SystemClass.FormId == item[property]
      );

      menuItems = this.MainMenu.menuItem_Array.filter(
        (item) =>
          item[property] !== undefined && SystemClass.FormId == item[property]
      );
    }

    // Write by Ali Kamel 
    // method for finding the active menu Item has been updated. 
    if (menuItems && menuItems.length > 1 && SystemClass.tblMenuItemId_Opened) {
      const selectedMenuItem = menuItems.find(
        (item) =>
          item.tblMenuItemId == SystemClass.tblMenuItemId_Opened
      );
      if (selectedMenuItem) {
        menuItem = selectedMenuItem;
      }
    }
    // End


    this.data.activeMenuItems = [];

    if (menuItem) {
      const addMenuItem = (item) => {
        if (!item) return;
        this.data.activeMenuItems.push(item.tblMenuItemId);
        if (item.menuItem_ParentId) {
          addMenuItem(
            this.MainMenu.menuItem_Array.find(
              (i) => item.menuItem_ParentId == i.tblMenuItemId
            )
          );
        }
      };
      addMenuItem(menuItem);
    }
  };

  _getDefaultImage = () => {
    if (UiSetting.GetSetting("logo") === "fintrac") {
      return LoginLogo2;
    } else {
      return LoginLogo;
    }
  };
  //endregion

  //region events
  _handleWindowResize = (event) => {
    this.data.needUpdateMenuSize = true;
    this.forceUpdate();
  };
  _handleWindowUpdateOnlineStatus = (event) => {
    if (this.data.online != navigator.onLine) {
      this.data.online = navigator.onLine;
      this.forceUpdate();
    }
  };

  _openDialog = async (menuItem) => {
    //callback to pass to dialog to run when closed
    let closeDialogCallback = () => {};

    //call webservice to get data and then open dialog
    await SystemClass.setLoading(true);
    SystemClass.webService_GetForm(
      menuItem.menuItem_FormCid,
      menuItem.menuItem_Form_ParamList,
      null
    )
      .then((jsFormFieldInfo) => {
        if (!jsFormFieldInfo) return;
        SystemClass.openDialog(
          menuItem.menuItem_FormCid,
          menuItem.menuItem_Form_ParamList,
          null,
          closeDialogCallback
        );
      })
      .finally(() => SystemClass.setLoading(false));
  };

  _handleOnItemSelect = (menuItem) => {
    const isDashboard = menuItem.show_PageIsLoading;
    SystemClass.tblMenuItemId_Selected = menuItem.tblMenuItemId;
    SystemClass.showCustomLoading(isDashboard);

    if (menuItem.menuItem_OpenDialog) {
      this._openDialog(menuItem);
      return;
    }

    const params = menuItem.menuItem_Form_ParamList || {};
    const formParams = params.formParams || {};

    if (menuItem.menuItem_Frame_UseFrame && menuItem.menuItem_Frame_Url) {
      if (formParams.openInNewTab) {
        window.open(
          menuItem.menuItem_Frame_Url,
          "_blank",
          "noopener,noreferrer"
        );
      } else {
        SystemClass.openFrame(menuItem.menuItem_Frame_Url);
      }
    } else if (menuItem.menuItem_FormName && menuItem.menuItem_FormCid) {
      SystemClass.openForm(
        menuItem.menuItem_FormCid,
        menuItem.menuItem_Form_ParamList
      );
    } else {
      menuItem.menuItem_Url && SystemClass.pushLink(menuItem.menuItem_Url);
    }
  };

  _handleToggleMenuItem = (menuItem, open) => {
    if (open === undefined)
      open = this.state["openMenu" + menuItem.tblMenuItemId];
    this.setState({ ["openMenu" + menuItem.tblMenuItemId]: open });
  };

  _handleToggleMoreMenuItem = (open) => {
    if (open === undefined) open = this.state["openMoreMenu"];
    this.setState({ openMoreMenu: open });
  };

  _handleToggleSearchBar = (show) => {
    this.state.showSearchBar = show;
    this.setState({ showSearchBar: show });
  };

  _goToLogin() {
    SystemClass.pushLink("/auth/login");
  }

  _handleOnProfileClick = (event) => {
    SystemClass.ProfileDialog.showDialog(true);
  };

  _handleLogoutClick = async (event) => {
    event && event.stopPropagation();
    event && event.preventDefault();

    await SystemClass.setLoading(true);

    return new WebService(WebService.URL.webService_Logout, {})
      .then((json) => {
        // window.close()
        SystemClass.logOut();
        this._goToLogin();
      })
      .finally((i) => SystemClass.setLoading(false));
  };

  //endregion

  // region element
  _elementGetModalItemList = () => {
    return this.data.modalList.map(this._elementGetModalItem);
  };

  _elementGetMenuItem = (menuItem, index, isSubMenu) => {
    const subMenuList = this.MainMenu.menuItem_Array.filter(
      (item) => item.menuItem_ParentId == menuItem.tblMenuItemId
    );

    isSubMenu = isSubMenu || menuItem.menuItem_ParentId;

    const disabled = !!menuItem.menuItem_IsDisabled;
    const haveSubMenu = subMenuList.length > 0 && !disabled;

    const leftAline = this.align == "left"; /* write by ali kamel*/
    const rightAline = this.align == "right"; /* write by ali kamel*/

    const className = [
      "MenuItem__dropdown-menu",
      this.state["openMenu" + menuItem.tblMenuItemId] &&
        "MenuItem__dropdown-menu--show",
      isSubMenu && "MenuItem__dropdown-menu--submenu",
      rightAline && "MenuItem__dropdown-menu--fa" /* write by ali kamel*/,
      leftAline && "MenuItem__dropdown-menu--en" /* write by ali kamel*/,
    ];

    const activeClass =
      this.data.activeMenuItems.includes(menuItem.tblMenuItemId) &&
      "MenuItem__button--active";

    return (
      <div
        key={
          menuItem.tblMenuItemId +
          (menuItem.menuItem_IsMobile ? "mobile" : "web")
        }
        className={"MenuItem"}
        onMouseEnter={this._handleToggleMenuItem.bind(this, menuItem, true)}
        onMouseLeave={this._handleToggleMenuItem.bind(this, menuItem, false)}
      >
        {!isSubMenu ? (
          <Button
            size="sm"
            className={["MenuItem__button", activeClass]
              .filter((c) => c)
              .join(" ")}
            color="transparent"
            onClick={this._handleOnItemSelect.bind(this, menuItem)}
            disabled={disabled}
          >
            {/* <div>
              {menuItem.menuItem_IconName && (
                <FontAwesome
                  className={"MenuItem__button__icon"}
                  name={menuItem.menuItem_IconName}
                />
              )}
            </div> */}
            <div>
              <span className={"MenuItem__displayName"}>
                {menuItem.menuItem_DisplayName !== "تنظیمات"
                  ? menuItem.menuItem_DisplayName
                  : ""}
              </span>
              {haveSubMenu && (
                <FontAwesome
                  style={{ marginRight: ".25rem" }}
                  className={"MenuItem__button__icon"}
                  name="caret-down"
                />
              )}
            </div>
          </Button>
        ) : (
          <button
            size="sm"
            className={["MenuItem__item", activeClass]
              .filter((c) => c)
              .join(" ")}
            color="transparent"
            onClick={this._handleOnItemSelect.bind(this, menuItem)}
            disabled={disabled}
          >
            {menuItem.menuItem_IconName && (
              <FontAwesome
                className={"MenuItem__button__icon"}
                name={menuItem.menuItem_IconName}
              />
            )}
            <span className={"MenuItem__displayName"}>
              {menuItem.menuItem_DisplayName !== "تنظیمات"
                ? menuItem.menuItem_DisplayName
                : ""}
            </span>
            <div style={{ flex: 1 }} />
            {haveSubMenu && (
              <FontAwesome
                className={"MenuItem__button__icon"}
                name="caret-left"
              />
            )}
          </button>
        )}

        {haveSubMenu && (
          <div
            tabIndex="-1"
            role="menu"
            aria-hidden="false"
            className={className.filter((c) => c).join(" ")}
          >
            {subMenuList.map((item, index) =>
              this._elementGetMenuItem(item, index, false)
            )}
          </div>
        )}
      </div>
    );
  };

  _elementGetMoreMenuItem = (hiddenList) => {
    const subMenuList = hiddenList;

    const className = [
      "MenuItem__dropdown-menu",
      this.state["openMoreMenu"] && "MenuItem__dropdown-menu--show",
    ];
    const activeClass =
      subMenuList.find((item) =>
        this.data.activeMenuItems.includes(item.tblMenuItemId)
      ) && "MenuItem__button--active";
    return (
      <div
        key={-1}
        className={"MenuItem"}
        onMouseEnter={this._handleToggleMoreMenuItem.bind(this, true)}
        onMouseLeave={this._handleToggleMoreMenuItem.bind(this, false)}
      >
        <Button className={"Menu__icon " + activeClass} outline color="light">
          <FontAwesome className={""} name="ellipsis-v" />
        </Button>

        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={className.filter((c) => c).join(" ")}
        >
          {subMenuList.map((item, index) =>
            this._elementGetMenuItem(item, index, true)
          )}
        </div>
      </div>
    );
  };

  _elementGetMenuRightSection = () => {
    if (!this.data.node || !this.data.node.querySelector(".Menu__container"))
      return;

    this._updateActiveMenuItems();

    if (this.data.needUpdateMenuSize) {
      const maxMenuItemLength = 53;
      const maxIconItemLength = 95;

      const width =
        this.data.node.querySelector(".Menu__container").clientWidth -
        maxIconItemLength * 2;
      const maxLength = width / maxMenuItemLength;
      this.data.maxMenuItemInMenuBar = maxLength;
    }

    const menuBarList = this.MainMenu.menuItem_Array.filter(
      (item) => !item.menuItem_ShowOnUserMenu && !item.menuItem_ParentId
    );
    const showList = menuBarList.slice(0, this.data.maxMenuItemInMenuBar);
    const hiddenList = menuBarList.slice(this.data.maxMenuItemInMenuBar);

    const showDot = hiddenList.length > 0;

    return (
      <Fragment>
        <Button className={"Menu__icon Menu__home-icon"} outline color="light">
          <FontAwesome className={""} name="home" />
        </Button>

        {showList.map((item, index) =>
          this._elementGetMenuItem(item, index, false)
        )}

        {showDot && this._elementGetMoreMenuItem(hiddenList)}
      </Fragment>
    );
  };

  _elementGetUserMenu = () => {
    const userMenuBarList = this.MainMenu.menuItem_Array.filter(
      (item) => item.menuItem_ShowOnUserMenu
    );

    return userMenuBarList.map((userMenu) => {
      return (
        <button
          key={
            userMenu.tblMenuItemId +
            (userMenu.menuItem_IsMobile ? "mobile" : "web")
          }
          size="sm"
          className={["MenuItem__item"].filter((c) => c).join(" ")}
          color="light"
          onClick={this._handleOnItemSelect.bind(this, userMenu)}
          disabled={userMenu.menuItem_IsDisabled}
        >
          <FontAwesome
            className={"MenuItem__button__icon"}
            name={userMenu.menuItem_IconName || "user-cog"}
          />
          <span className={"MenuItem__displayName"}>
            {" "}
            {userMenu.menuItem_DisplayName}{" "}
          </span>
        </button>
      );
    });
  };

  // endregion element
  render() {
    const showSearchBar = this.state.showSearchBar;

    return (
      <div
        className={[
          "MainMenu",
          this.MainMenu.isJaneshin && "MainMenu--janeshin",
        ]
          .filter((c) => c)
          .join(" ")}
      >
        <div
          className={["Menu__container", "menu__container--stretch"]
            .filter((c) => c)
            .join(" ")}
        >
          {this._elementGetMenuRightSection()}
        </div>

        {/*<LogoMapsun className={["Menu__logo"].filter(c => c).join(' ')}/>*/}
        {/*<img className={["Menu__logo"].filter(c => c).join(' ')} src={LogoMapsunFile}/>*/}

        <div className={["Menu__container"].filter((c) => c).join(" ")}>
          <div
            className={[
              "Menu__container",
              "Menu__searchBar",
              showSearchBar && "Menu__searchBar--show",
            ]
              .filter((c) => c)
              .join(" ")}
          >
            {/*<FontAwesomeIcon className={''} icon="search"/>*/}
            <Button className={"Menu__icon"} outline color="light">
              <FontAwesome className={""} name="search" />
            </Button>

            <input className={"Menu__input"} />

            <Button
              className={"Menu__icon Menu__close-search-icon"}
              outline
              color="light"
              onClick={this._handleToggleSearchBar.bind(this, false)}
            >
              <FontAwesome className={""} name="times" />
            </Button>
          </div>

          <div
            className={["Menu__search-icon__container"]
              .filter((c) => c)
              .join(" ")}
          >
            <Button
              className={["Menu__icon", "Menu__search-icon"]
                .filter((c) => c)
                .join(" ")}
              outline
              color="light"
              onClick={this._handleToggleSearchBar.bind(this, true)}
            >
              <FontAwesome className={""} name="search" />
            </Button>
          </div>

          {/* <ConnectionStatus/> */}
          {/*{this._elementGetSignalIcon()}*/}

          <div
            className={"MenuItem__Janeshin"}
            id={"MenuItem__Janeshin"}
            style={{ display: this.MainMenu.isJaneshin ? "flex" : "none" }}
          >
            <Button
              size="sm"
              className={["MenuItem__button--janeshin"]
                .filter((c) => c)
                .join(" ")}
              outline
              color="light"
            >
              <span className={"MenuItem__displayName"}> جانشین </span>
            </Button>

            {this.data.nodeJaneshin && (
              <UncontrolledTooltip target={this.data.nodeJaneshin}>
                {"پُست جانشین شده: " + this.MainMenu.namePost}
              </UncontrolledTooltip>
            )}
          </div>

          <Popup
            flowing
            hoverable
            trigger={
              <div className="Menu__avatar-container">
                <span className="Menu__avatar__text">
                  {/*{this._getUserInits()}*/}
                </span>

                <img
                  className="Menu__avatar"
                  alt=""
                  src={
                    SystemClass.getLastUserImage() || this._getDefaultImage()
                  }
                />
              </div>
            }
          >
            <button
              size="sm"
              className={["MenuItem__item"].filter((c) => c).join(" ")}
              color="light"
              onClick={this._handleLogoutClick}
            >
              <FontAwesome
                className={"MenuItem__button__icon"}
                name="user-alt-slash"
              />
               
              <span className={"MenuItem__displayName"}>
                <Translation>{(t) => (t("SignOut"))}</Translation>
              </span>
            </button>

            <button
              size="sm"
              className={["MenuItem__item"].filter((c) => c).join(" ")}
              color="light"
              onClick={this._handleOnProfileClick}
            >
              <FontAwesome
                className={"MenuItem__button__icon"}
                name="user-cog"
              />
              <span className={"MenuItem__displayName"}>
                <Translation>{(t) => (t("UserProfile"))}</Translation>
              </span>
            </button>

            {this._elementGetUserMenu()}
          </Popup>

          {/*<div className="Menu__avatar-container">*/}
          {/*<span className="Menu__avatar__text">*/}
          {/*{this.MainMenu.userInitials}*/}
          {/*</span>*/}
          {/*<img className="Menu__avatar" alt="" src={this.MainMenu.userImage || this.data.userImage}/>*/}
          {/*</div>*/}
        </div>

        <div
          className={[
            "MainMenu__Progress",
            this.MainMenu.isJaneshin && "MenuItem__janeshinBar",
          ]
            .filter((c) => c)
            .join(" ")}
        />

        <div
          id="MainMenuProgress"
          className={[
            "MainMenu__Progress",
            SystemClass.MenuLoading && "MainMenu__Progress--show",
          ]
            .filter((c) => c)
            .join(" ")}
        >
          <ProgressBar />
        </div>
      </div>
    );
  }
}

export default Menu;
