<%--
    Copyright (C) 2015 Infinite Automation Systems Inc. All rights reserved.
    @author Terry Packer
--%><%@page import="com.infiniteautomation.dashboards.DashboardsCommon"%>
<%@ include file="/WEB-INF/jsp/include/tech.jsp" %>

<c:set var="publicUrlPrefix"><%= DashboardsCommon.DASHBOARDS_PUBLIC_URL_PREFIX %></c:set>
<c:set var="publicFilesLocation"><%= DashboardsCommon.DASHBOARDS_PUBLIC_FILES_LOCATION %></c:set>
<c:set var="privateUrlPrefix"><%= DashboardsCommon.DASHBOARDS_PRIVATE_URL_PREFIX %></c:set>
<c:set var="privateFilesLocation"><%= DashboardsCommon.DASHBOARDS_PRIVATE_FILES_LOCATION %></c:set>
<c:set var="iconDestination"><%= DashboardsCommon.DASHBOARDS_ICON_DESTINATION %></c:set>
<c:set var="iconLocation"><%= DashboardsCommon.DASHBOARDS_ICON_LOCATION %></c:set>
<c:set var="loginPage"><%= DashboardsCommon.DASHBOARDS_LOGIN_PAGE %></c:set>
<c:set var="firstUserLoginPage"><%= DashboardsCommon.DASHBOARDS_FIRST_USER_LOGIN_PAGE %></c:set>
<c:set var="firstLoginPage"><%= DashboardsCommon.DASHBOARDS_FIRST_LOGIN_PAGE %></c:set>
<c:set var="loggedInPage"><%= DashboardsCommon.DASHBOARDS_LOGGED_IN_PAGE %></c:set>
<c:set var="unauthorizedPage"><%= DashboardsCommon.DASHBOARDS_UNAUTHORIZED_PAGE %></c:set>

<c:set var="defaultPublicUrlPrefix"><%= DashboardsCommon.DEFAULT_DASHBOARDS_PUBLIC_URL_PREFIX %></c:set>
<c:set var="defaultPublicFilesLocation"><%= DashboardsCommon.DEFAULT_DASHBOARDS_PUBLIC_FILES_LOCATION %></c:set>
<c:set var="defaultPrivateUrlPrefix"><%= DashboardsCommon.DEFAULT_DASHBOARDS_PRIVATE_URL_PREFIX %></c:set>
<c:set var="defaultPrivateFilesLocation"><%= DashboardsCommon.DEFAULT_DASHBOARDS_PRIVATE_FILES_LOCATION %></c:set>
<c:set var="defaultIconDestination"><%= DashboardsCommon.DEFAULT_DASHBOARDS_ICON_DESTINATION %></c:set>
<c:set var="defaultIconLocation"><%= DashboardsCommon.DEFAULT_DASHBOARDS_ICON_LOCATION %></c:set>
<c:set var="defaultLoginPage"><%= DashboardsCommon.DEFAULT_DASHBOARDS_LOGIN_PAGE %></c:set>
<c:set var="defaultFirstUserLoginPage"><%= DashboardsCommon.DEFAULT_DASHBOARDS_FIRST_USER_LOGIN_PAGE %></c:set>
<c:set var="defaultFirstLoginPage"><%= DashboardsCommon.DEFAULT_DASHBOARDS_FIRST_LOGIN_PAGE %></c:set>
<c:set var="defaultLoggedInPage"><%= DashboardsCommon.DEFAULT_DASHBOARDS_LOGGED_IN_PAGE %></c:set>
<c:set var="defaultUnauthorizedPage"><%= DashboardsCommon.DEFAULT_DASHBOARDS_UNAUTHORIZED_PAGE %></c:set>

<script type="text/javascript">

  function saveDashboardsSettings() {
      setUserMessage("dashboardsMessage");
      setDisabled("saveDashboardsSettingsBtn", true);
      
    var publicUrlPrefix = $get("${publicUrlPrefix}");
    var publicFilesLocation = $get("${publicFilesLocation}");
    var privateUrlPrefix = $get("${privateUrlPrefix}");
    var privateFilesLocation = $get("${privateFilesLocation}");
    var iconDestination = $get("${iconDestination}");
    var iconLocation = $get("${iconLocation}");
    var publicUrlPrefix = $get("${publicUrlPrefix}");
    var loginPage = $get("${loginPage}");
    var firstUserLoginPage = $get("${firstUserLoginPage}");
    var firstLoginPage = $get("${firstLoginPage}");
    var loggedInPage = $get("${loggedInPage}");
    var unauthorizedPage = $get("${unauthorizedPage}");
      
    var settings = {};
    settings["${publicUrlPrefix}"] = publicUrlPrefix === '${defaultPublicUrlPrefix}' ? null : publicUrlPrefix;
    settings["${publicFilesLocation}"] = publicFilesLocation === '${defaultPublicFilesLocation}' ? null : publicFilesLocation;
    settings["${privateUrlPrefix}"] = privateUrlPrefix === '${defaultPrivateUrlPrefix}' ? null : privateUrlPrefix;
    settings["${privateFilesLocation}"] = privateFilesLocation === '${defaultPrivateFilesLocation}' ? null : privateFilesLocation;
    settings["${iconDestination}"] = iconDestination === '${defaultIconDestination}' ? null : iconDestination;
    settings["${iconLocation}"] = iconLocation === '${defaultIconLocation}' ? null : iconLocation;
    settings["${loginPage}"] = loginPage === '${defaultLoginPage}' ? null : loginPage;
    settings["${firstUserLoginPage}"] = firstUserLoginPage === '${defaultFirstUserLoginPage}' ? null : firstUserLoginPage;
    settings["${firstLoginPage}"] = firstLoginPage === '${defaultFirstLoginPage}' ? null : firstLoginPage;
    settings["${loggedInPage}"] = loggedInPage === '${defaultLoggedInPage}' ? null : loggedInPage;
    settings["${unauthorizedPage}"] = unauthorizedPage === '${defaultUnauthorizedPage}' ? null : unauthorizedPage;

    SystemSettingsDwr.saveSettings(settings, function() {
          setDisabled("saveDashboardsSettingsBtn", false);
          setUserMessage("dashboardsMessage", "<fmt:message key='dashboards.settings.saved'/>");
    });
  }

</script>
<table>
  <tr>
    <td class="formLabelRequired"><fmt:message key="dashboards.settings.publicUrlPrefix"/></td>
    <td class="formField">
      <input id="${publicUrlPrefix}" type="text" value="<m2m2:systemSetting key="${publicUrlPrefix}" defaultValue="${defaultPublicUrlPrefix}"/>" class="formLong"/>
    </td>
  </tr>
  <tr>
    <td class="formLabelRequired"><fmt:message key="dashboards.settings.publicFilesLocation"/></td>
    <td class="formField">
      <input id="${publicFilesLocation}" type="text" value="<m2m2:systemSetting key="${publicFilesLocation}" defaultValue="${defaultPublicFilesLocation}"/>" class="formLong"/>
    </td>
  </tr>  
  
  <tr>
    <td class="formLabelRequired"><fmt:message key="dashboards.settings.privateUrlPrefix"/></td>
    <td class="formField">
      <input id="${privateUrlPrefix}" type="text" value="<m2m2:systemSetting key="${privateUrlPrefix}" defaultValue="${defaultPrivateUrlPrefix}"/>" class="formLong"/>
    </td>
  </tr>  
  <tr>
    <td class="formLabelRequired"><fmt:message key="dashboards.settings.privateFilesLocation"/></td>
    <td class="formField">
      <input id="${privateFilesLocation}" type="text" value="<m2m2:systemSetting key="${privateFilesLocation}" defaultValue="${defaultPrivateFilesLocation}"/>" class="formLong"/>
    </td>
  </tr>  

  <tr>
    <td class="formLabelRequired"><fmt:message key="dashboards.settings.iconDestination"/></td>
    <td class="formField">
      <input id="${iconDestination}" type="text" value="<m2m2:systemSetting key="${iconDestination}" defaultValue="${defaultIconDestination}"/>" class="formLong"/>
    </td>
  </tr>  
  <tr>
    <td class="formLabelRequired"><fmt:message key="dashboards.settings.iconLocation"/></td>
    <td class="formField">
      <input id="${iconLocation}" type="text" value="<m2m2:systemSetting key="${iconLocation}" defaultValue="${defaultIconLocation}"/>" class="formLong"/>
    </td>
  </tr>  
  
  <tr>
    <td class="formLabelRequired"><fmt:message key="dashboards.settings.loginPage"/></td>
    <td class="formField">
      <input id="${loginPage}" type="text" value="<m2m2:systemSetting key="${loginPage}" defaultValue="${defaultLoginPage}"/>" class="formLong"/>
    </td>
  </tr>

  <tr>
    <td class="formLabelRequired"><fmt:message key="dashboards.settings.firstUserLoginPage"/></td>
    <td class="formField">
      <input id="${firstUserLoginPage}" type="text" value="<m2m2:systemSetting key="${firstUserLoginPage}" defaultValue="${defaultFirstUserLoginPage}"/>" class="formLong"/>
    </td>
  </tr>

  <tr>
    <td class="formLabelRequired"><fmt:message key="dashboards.settings.firstLoginPage"/></td>
    <td class="formField">
      <input id="${firstLoginPage}" type="text" value="<m2m2:systemSetting key="${firstLoginPage}" defaultValue="${defaultFirstLoginPage}"/>" class="formLong"/>
    </td>
  </tr>

  <tr>
    <td class="formLabelRequired"><fmt:message key="dashboards.settings.loggedInPage"/></td>
    <td class="formField">
      <input id="${loggedInPage}" type="text" value="<m2m2:systemSetting key="${loggedInPage}" defaultValue="${defaultLoggedInPage}"/>" class="formLong"/>
    </td>
  </tr>

  <tr>
    <td class="formLabelRequired"><fmt:message key="dashboards.settings.unauthorizedPage"/></td>
    <td class="formField">
      <input id="${unauthorizedPage}" type="text" value="<m2m2:systemSetting key="${unauthorizedPage}" defaultValue="${defaultUnauthorizedPage}"/>" class="formLong"/>
    </td>
  </tr>

  <tr>
    <td colspan="2" align="center">
      <input id="saveDashboardsSettingsBtn" type="button" value="<fmt:message key="common.save"/>" onclick="saveDashboardsSettings()"/>
      <tag:help id="dashboardsSettings"/>
    </td>
  </tr>
  <tr><td colspan="2" id="dashboardsMessage" class="formError"></td></tr>
</table>