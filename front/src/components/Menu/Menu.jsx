import React, { Fragment, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  UncontrolledTooltip,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import LoginLogo from "../../content/first-page-logo.jpg";
import LoginLogo2 from "../../content/ok logo.png";
import "./Menu.css";

import SystemClass from "../../SystemClass";
import FontAwesome from "react-fontawesome";
import ProgressBar from "../ProgressBar/ProgressBar";
import WebService from "../../WebService";
import UiSetting from "../../UiSetting";
import { Translation } from "react-i18next";


function Menu() {
  const navigate = useNavigate();
  const rootNodeRef = useRef(null);
  const janeshinNodeRef = useRef(null);

  // مدیریت state با هوک useState
  const [openMenus, setOpenMenus] = useState({});
  const [openMoreMenu, setOpenMoreMenu] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [mainMenu, setMainMenu] = useState({ menuItem_Array: [] });
  const [userImage, setUserImage] = useState(SystemClass.getLastUserImage());
  const [maxMenuItemInMenuBar, setMaxMenuItemInMenuBar] = useState(-1);
  const [activeMenuItems, setActiveMenuItems] = useState([]);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const align = UiSetting.GetSetting("textAlign");

  // معادل getInitialDataSources و بخشی از componentDidMount
  useEffect(() => {
    SystemClass.MenuComponent = { update, updateImage }; // اتصال متدهای مورد نیاز به SystemClass

    const fetchInitialData = async () => {
      setLoaded(false);
      try {
        let menuDataSource;
        if (SystemClass.MainMenuData) {
          menuDataSource = SystemClass.MainMenuData;
        } else {
          menuDataSource = await new WebService(WebService.URL.webService_Menu, { paramList: {} });
        }

        if (menuDataSource && menuDataSource.menuItem_Array) {
          menuDataSource.menuItem_Array.sort((a, b) => a.menuItem_Tartib - b.menuItem_Tartib);
          SystemClass.MainMenuData = menuDataSource;
          setMainMenu(menuDataSource);
        }
      } catch (error) {
        console.error("Failed to load menu data:", error);
      } finally {
        setLoaded(true);
      }
    };

    if (!WebService.getUserInfo().login) {
      SystemClass.handleUnauthorizeError();
    } else {
      fetchInitialData();
    }
  }, []);

  // مدیریت رویداد تغییر سایز پنجره
  const _handleWindowResize = useCallback(() => {
    const menuContainer = rootNodeRef.current?.querySelector(".Menu__container");
    if (!menuContainer) return;

    const maxMenuItemLength = 53;
    const maxIconItemLength = 95;
    const width = menuContainer.clientWidth - maxIconItemLength * 2;
    const maxLength = Math.floor(width / maxMenuItemLength);
    setMaxMenuItemInMenuBar(maxLength);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", _handleWindowResize);
    // فراخوانی اولیه برای محاسبه اندازه منو
    _handleWindowResize();
    return () => {
      window.removeEventListener("resize", _handleWindowResize);
    };
  }, [_handleWindowResize]);

  // مدیریت آنلاین/آفلاین شدن
  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  // بروزرسانی آیتم‌های فعال منو بر اساس مسیر فعلی
  useEffect(() => {
    let currentUrl = window.location.pathname;
    let menuItem;
    let menuItems;
    let property = "menuItem_FormCid";

    if (!mainMenu.menuItem_Array) return;

    if (currentUrl.includes("frame")) {
      property = "menuItem_Frame_Url";
      menuItem = mainMenu.menuItem_Array.find(
        (item) => item[property] && currentUrl.includes(item[property])
      );
    } else {
      menuItems = mainMenu.menuItem_Array.filter(
        (item) => item[property] !== undefined && SystemClass.FormId == item[property]
      );
    }

    if (menuItems && menuItems.length > 1 && SystemClass.tblMenuItemId_Opened) {
      const selectedMenuItem = menuItems.find(
        (item) => item.tblMenuItemId == SystemClass.tblMenuItemId_Opened
      );
      if (selectedMenuItem) {
        menuItem = selectedMenuItem;
      }
    } else if (menuItems && menuItems.length === 1) {
      menuItem = menuItems[0];
    }

    const newActiveItems = [];
    if (menuItem) {
      const addMenuItem = (item) => {
        if (!item) return;
        newActiveItems.push(item.tblMenuItemId);
        if (item.menuItem_ParentId) {
          addMenuItem(
            mainMenu.menuItem_Array.find((i) => item.menuItem_ParentId == i.tblMenuItemId)
          );
        }
      };
      addMenuItem(menuItem);
    }
    setActiveMenuItems(newActiveItems);

  }, [window.location.pathname, mainMenu.menuItem_Array, SystemClass.FormId]);


  const update = () => {
    // این متد برای سازگاری با SystemClass حفظ شده است
    // در کامپوننت تابعی، re-render به صورت خودکار با تغییر state انجام می‌شود
    setOpenMenus({});
  };

  const updateImage = () => {
    setUserImage(SystemClass.getLastUserImage());
  };

  const _openDialog = async (menuItem) => {
    await SystemClass.setLoading(true);
    try {
      const formModel = await SystemClass.webService_GetForm(
        menuItem.menuItem_FormCid,
        menuItem.menuItem_Form_ParamList,
        null
      );
      if (formModel) {
        SystemClass.openDialog(
          menuItem.menuItem_FormCid,
          menuItem.menuItem_Form_ParamList,
          null,
          () => { } // closeDialogCallback
        );
      }
    } catch (error) {
      console.error("Error opening dialog:", error);
    } finally {
      SystemClass.setLoading(false);
    }
  };

  const _handleOnItemSelect = (menuItem) => {

    const isDashboard = menuItem.show_PageIsLoading;
    SystemClass.tblMenuItemId_Selected = menuItem.tblMenuItemId;
    SystemClass.showCustomLoading(isDashboard);
    
    if (menuItem.menuItem_ParentId)
      setOpenMenus({});

    if (menuItem.menuItem_OpenDialog) {
      _openDialog(menuItem);
      return;
    }

    const params = menuItem.menuItem_Form_ParamList || {};
    const formParams = params.formParams || {};

    if (menuItem.menuItem_FormName && menuItem.menuItem_FormCid) {
      const targetPath = `/form/${menuItem.menuItem_FormCid}`;

      SystemClass.setFormParam(menuItem.menuItem_FormCid, params);

      if (window.location.pathname === targetPath) {
        if (SystemClass.FormContainer && typeof SystemClass.FormContainer.reload === 'function') {
          SystemClass.FormContainer.reload();
        }
      } else {
        navigate(targetPath);
      }

    } else if (menuItem.menuItem_Frame_UseFrame && menuItem.menuItem_Frame_Url) {
      if (formParams.openInNewTab) {
        window.open(menuItem.menuItem_Frame_Url, "_blank", "noopener,noreferrer");
      } else {
        navigate(`/frame/${menuItem.menuItem_Frame_Url}`);
      }
    } else if (menuItem.menuItem_Url) {
      navigate(menuItem.menuItem_Url);
    }
  };

  const _handleToggleMenuItem = (menuItemId, open) => {
    setOpenMenus(prev => ({ ...prev, [menuItemId]: open }));
  };

  const _handleToggleMoreMenuItem = (open) => {
    setOpenMoreMenu(open);
  };

  const _handleOnProfileClick = () => {
    SystemClass.ProfileDialog.showDialog(true);
  };

  const _handleLogoutClick = async (event) => {
    event?.stopPropagation();
    event?.preventDefault();
    await SystemClass.setLoading(true);
    try {
      await new WebService(WebService.URL.webService_Logout, {});
      SystemClass.logOut();
      navigate("/auth/login"); // استفاده از navigate
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      SystemClass.setLoading(false);
    }
  };

  const _getDefaultImage = () => {
    return UiSetting.GetSetting("logo") === "fintrac" ? LoginLogo2 : LoginLogo;
  };


  const _elementGetMenuItem = (menuItem, index, isSubMenu) => {
    const subMenuList = mainMenu.menuItem_Array.filter(
      (item) => item.menuItem_ParentId === menuItem.tblMenuItemId
    );
    isSubMenu = isSubMenu || !!menuItem.menuItem_ParentId;
    const disabled = !!menuItem.menuItem_IsDisabled;
    const haveSubMenu = subMenuList.length > 0 && !disabled;

    const className = [
      "MenuItem__dropdown-menu",
      openMenus[menuItem.tblMenuItemId] && "MenuItem__dropdown-menu--show",
      isSubMenu && "MenuItem__dropdown-menu--submenu",
      align === "right" && "MenuItem__dropdown-menu--fa",
      align === "left" && "MenuItem__dropdown-menu--en",
    ].filter(Boolean).join(" ");

    const activeClass = activeMenuItems.includes(menuItem.tblMenuItemId) ? "MenuItem__button--active" : "";
    const menuItem_DisplayName = menuItem.menuItem_DisplayName !== "تنظیمات" ? menuItem.menuItem_DisplayName : "";
    return (
      <div
        key={`${menuItem.tblMenuItemId}-${index}`}
        className="MenuItem"
        onMouseEnter={() => _handleToggleMenuItem(menuItem.tblMenuItemId, true)}
        onMouseLeave={() => _handleToggleMenuItem(menuItem.tblMenuItemId, false)}
      >
        {!isSubMenu ? (
          <Button
            size="sm"
            className={`MenuItem__button ${activeClass}`.trim()}
            color="transparent"
            onClick={() => _handleOnItemSelect(menuItem)}
            disabled={disabled}
          >
            <div>
              <span className="MenuItem__displayName">{menuItem_DisplayName}</span>
              {haveSubMenu && (
                <FontAwesome style={{ marginRight: ".25rem" }} className="MenuItem__button__icon" name="caret-down" />
              )}
            </div>
          </Button>
        ) : (
          <button
            className={`MenuItem__item ${activeClass}`.trim()}
            onClick={() => _handleOnItemSelect(menuItem)}
            disabled={disabled}
          >
            {menuItem.menuItem_IconName && (
              <FontAwesome className="MenuItem__button__icon" name={menuItem.menuItem_IconName} />
            )}
            <span className="MenuItem__displayName">{menuItem_DisplayName}</span>
            <div style={{ flex: 1 }} />
            {haveSubMenu && (
              <FontAwesome className="MenuItem__button__icon" name="caret-left" />
            )}
          </button>
        )}
        {haveSubMenu && (
          <div tabIndex="-1" role="menu" aria-hidden="false" className={className}>
            {subMenuList.map((item, subIndex) => _elementGetMenuItem(item, subIndex, false))}
          </div>
        )}
      </div>
    );
  };

  const _elementGetMoreMenuItem = (hiddenList) => {
    const className = ["MenuItem__dropdown-menu", openMoreMenu && "MenuItem__dropdown-menu--show"].filter(Boolean).join(" ");
    const isActive = hiddenList.some(item => activeMenuItems.includes(item.tblMenuItemId));

    return (
      <div
        key={-1}
        className="MenuItem"
        onMouseEnter={() => _handleToggleMoreMenuItem(true)}
        onMouseLeave={() => _handleToggleMoreMenuItem(false)}
      >
        <Button className={`Menu__icon ${isActive ? "MenuItem__button--active" : ""}`.trim()} outline color="light">
          <FontAwesome name="ellipsis-v" />
        </Button>
        <div tabIndex="-1" role="menu" aria-hidden="false" className={className}>
          {hiddenList.map((item, index) => _elementGetMenuItem(item, index, true))}
        </div>
      </div>
    );
  };

  const _elementGetMenuRightSection = () => {
    if (!mainMenu.menuItem_Array) return null;

    const menuBarList = mainMenu.menuItem_Array.filter(
      (item) => !item.menuItem_ShowOnUserMenu && !item.menuItem_ParentId
    );

    const showList = maxMenuItemInMenuBar > 0 ? menuBarList.slice(0, maxMenuItemInMenuBar) : menuBarList;
    const hiddenList = maxMenuItemInMenuBar > 0 ? menuBarList.slice(maxMenuItemInMenuBar) : [];
    const showDot = hiddenList.length > 0;

    return (
      <Fragment>
        <Button className="Menu__icon Menu__home-icon" outline color="light" onClick={() => navigate("/")}>
          <FontAwesome name="home" />
        </Button>
        {showList.map((item, index) => _elementGetMenuItem(item, index, false))}
        {showDot && _elementGetMoreMenuItem(hiddenList)}
      </Fragment>
    );
  };

  const _elementGetUserMenu = () => {
    if (!mainMenu.menuItem_Array) return [];
    const userMenuBarList = mainMenu.menuItem_Array.filter(item => item.menuItem_ShowOnUserMenu);
    return userMenuBarList.map((userMenu, index) => (
      <button
        key={`${userMenu.tblMenuItemId}-${index}`}
        className={["MenuItem__item"].filter((c) => c).join(" ")}
        onClick={() => _handleOnItemSelect(userMenu)}
        disabled={userMenu.menuItem_IsDisabled}
      >
        <FontAwesome className="MenuItem__button__icon" name={userMenu.menuItem_IconName || "user-cog"} />
        <span className="MenuItem__displayName">{userMenu.menuItem_DisplayName}</span>
      </button>
    ));
  };


  return (
    <div
      ref={rootNodeRef}
      className={`MainMenu ${mainMenu.isJaneshin ? "MainMenu--janeshin" : ""}`.trim()}
    >
      <div className="Menu__container menu__container--stretch">
        {_elementGetMenuRightSection()}
      </div>

      <div className="Menu__container">
        <div className={`Menu__container Menu__searchBar ${showSearchBar ? "Menu__searchBar--show" : ""}`.trim()}>
          <Button className="Menu__icon" outline color="light">
            <FontAwesome name="search" />
          </Button>
          <input className="Menu__input" />
          <Button
            className="Menu__icon Menu__close-search-icon"
            outline
            color="light"
            onClick={() => setShowSearchBar(false)}
          >
            <FontAwesome name="times" />
          </Button>
        </div>

        <div className="Menu__search-icon__container">
          <Button
            className="Menu__icon Menu__search-icon"
            outline
            color="light"
            onClick={() => setShowSearchBar(true)}
          >
            <FontAwesome name="search" />
          </Button>
        </div>

        {mainMenu.isJaneshin && (
          <div
            ref={janeshinNodeRef}
            className="MenuItem__Janeshin"
            id="MenuItem__Janeshin"
          >
            <Button size="sm" className="MenuItem__button--janeshin" outline color="light">
              <span className="MenuItem__displayName"> جانشین </span>
            </Button>
            <UncontrolledTooltip target={janeshinNodeRef}>
              {"پُست جانشین شده: " + mainMenu.namePost}
            </UncontrolledTooltip>
          </div>
        )}

        <UncontrolledDropdown nav inNavbar>
          <DropdownToggle nav className="p-0">
            <div className="Menu__avatar-container">
              <img className="Menu__avatar" alt="User Avatar" src={userImage || _getDefaultImage()} />
            </div>
          </DropdownToggle>
          <DropdownMenu className="popup">
            <button
              size="sm"
              className={["MenuItem__item"].filter((c) => c).join(" ")}
              color="light"
              onClick={_handleLogoutClick}
            >
              <FontAwesome className="MenuItem__button__icon" name="user-alt-slash" />
              <span className="MenuItem__displayName">
                <Translation>{(t) => t("SignOut")}</Translation>
              </span>
            </button>

            <button
              size="sm"
              className={["MenuItem__item"].filter((c) => c).join(" ")}
              color="light"
              onClick={_handleOnProfileClick}
            >
              <FontAwesome className="MenuItem__button__icon" name="user-cog" />
              <span className="MenuItem__displayName">
                <Translation>{(t) => t("UserProfile")}</Translation>
              </span>
            </button>
            {_elementGetUserMenu()}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>

      <div
        className={`MainMenu__Progress ${mainMenu.isJaneshin ? "MenuItem__janeshinBar" : ""}`.trim()}
      />

      <div
        id="MainMenuProgress"
        className={`MainMenu__Progress ${SystemClass.loading ? "MainMenu__Progress--show" : ""}`.trim()}
      >
        <ProgressBar />
      </div>
    </div>
  );
}

export default Menu;