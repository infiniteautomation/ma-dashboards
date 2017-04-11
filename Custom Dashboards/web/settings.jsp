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

<c:set var="defaultPublicUrlPrefix"><%= DashboardsCommon.DEFAULT_DASHBOARDS_PUBLIC_URL_PREFIX %></c:set>
<c:set var="defaultPublicFilesLocation"><%= DashboardsCommon.DEFAULT_DASHBOARDS_PUBLIC_FILES_LOCATION %></c:set>
<c:set var="defaultPrivateUrlPrefix"><%= DashboardsCommon.DEFAULT_DASHBOARDS_PRIVATE_URL_PREFIX %></c:set>
<c:set var="defaultPrivateFilesLocation"><%= DashboardsCommon.DEFAULT_DASHBOARDS_PRIVATE_FILES_LOCATION %></c:set>
<c:set var="defaultIconDestination"><%= DashboardsCommon.DEFAULT_DASHBOARDS_ICON_DESTINATION %></c:set>
<c:set var="defaultIconLocation"><%= DashboardsCommon.DEFAULT_DASHBOARDS_ICON_LOCATION %></c:set>
<c:set var="defaultLoginPage"><%= DashboardsCommon.DEFAULT_DASHBOARDS_LOGIN_PAGE %></c:set>

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
      
    var settings = {};
    settings["${publicUrlPrefix}"] = publicUrlPrefix === '${defaultPublicUrlPrefix}' ? null : publicUrlPrefix;
    settings["${publicFilesLocation}"] = publicFilesLocation === '${defaultPublicFilesLocation}' ? null : publicFilesLocation;
    settings["${privateUrlPrefix}"] = privateUrlPrefix === '${defaultPrivateUrlPrefix}' ? null : privateUrlPrefix;
    settings["${privateFilesLocation}"] = privateFilesLocation === '${defaultPrivateFilesLocation}' ? null : privateFilesLocation;
    settings["${iconDestination}"] = iconDestination === '${defaultIconDestination}' ? null : iconDestination;
    settings["${iconLocation}"] = iconLocation === '${defaultIconLocation}' ? null : iconLocation;
    settings["${loginPage}"] = loginPage === '${defaultLoginPage}' ? null : loginPage;

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
    <td colspan="2" align="center">
      <input id="saveDashboardsSettingsBtn" type="button" value="<fmt:message key="common.save"/>" onclick="saveDashboardsSettings()"/>
      <tag:help id="dashboardsSettings"/>
    </td>
  </tr>
  <tr><td colspan="2" id="dashboardsMessage" class="formError"></td></tr>
</table>