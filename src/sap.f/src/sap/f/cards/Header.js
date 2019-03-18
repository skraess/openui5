/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/library",
	"sap/ui/core/Control",
	"sap/m/Text",
	"sap/f/Avatar",
	"sap/ui/Device",
	'sap/f/cards/DataProviderFactory',
	'sap/ui/model/json/JSONModel',
	"sap/f/cards/HeaderRenderer",
	"sap/f/cards/ActionEnablement"
], function (
	library,
	Control,
	Text,
	Avatar,
	Device,
	DataProviderFactory,
	JSONModel,
	HeaderRenderer,
	ActionEnablement
) {
	"use strict";

	var AvatarShape = library.AvatarShape;

	/**
	 * Constructor for a new <code>Header</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control used to group a set of card attributes in a header.
	 *
	 * <h3>Overview</h3>
	 * The <code>Header</code> displays general information about the card.
	 * You can configure the title, subtitle, status text and icon, using properties.
	 *
	 * <h3>Usage</h3>
	 * You should always set a title.
	 * To show a KPI or any numeric information, use {@link sap.f.cards.NumericHeader NumericHeader} instead.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.f.cards.IHeader
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.64
	 * @alias sap.f.cards.Header
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Header = Control.extend("sap.f.cards.Header", {
		metadata: {
			interfaces: ["sap.f.cards.IHeader"],
			properties: {

				/**
				 * Defines the title.
				 */
				title: { type: "string", defaultValue: "" },

				/**
				 * Defines the subtitle.
				 */
				subtitle: { type: "string", defaultValue: "" },

				/**
				 * Defines the status text.
				 */
				statusText: { type: "string", defaultValue: "" },

				/**
				 * Defines the shape of the icon.
				 */
				iconDisplayShape: { type: "sap.f.AvatarShape", defaultValue: AvatarShape.Circle },

				/**
				 * Defines the icon source.
				 */
				iconSrc: { type: "sap.ui.core.URI", defaultValue: "" },

				/**
				 * Defines the initials of the icon.
				 */
				iconInitials: { type: "string", defaultValue: "" }
			},
			aggregations: {

				/**
				 * Defines the inner title control.
				 */
				_title: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Defines the inner subtitle control.
				 */
				_subtitle: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Defines the inner avatar control.
				 */
				_avatar: { type: "sap.f.Avatar", multiple: false, visibility: "hidden" }
			},
			events: {

				/**
				 * Fires when the user presses the control.
				 */
				press: {}
			}
		}
	});

	/**
	 * Lazily creates a title and returns it.
	 * @private
	 * @returns {sap.m.Text} The inner title aggregation
	 */
	Header.prototype._getTitle = function () {
		var oTitle = this.getAggregation("_title");
		if (!oTitle) {
			oTitle = new Text({
				maxLines: 3
			}).addStyleClass("sapFCardTitle");
			this.setAggregation("_title", oTitle);
		}
		return oTitle;
	};

	/**
	 * Lazily creates a subtitle and returns it.
	 * @private
	 * @returns {sap.m.Text} The inner subtitle aggregation
	 */
	Header.prototype._getSubtitle = function () {
		var oSubtitle = this.getAggregation("_subtitle");
		if (!oSubtitle) {
			oSubtitle = new Text({
				maxLines: 2
			}).addStyleClass("sapFCardSubtitle");
			this.setAggregation("_subtitle", oSubtitle);
		}
		return oSubtitle;
	};

	/**
	 * Lazily creates an avatar control and returns it.
	 * @private
	 * @returns {sap.f.Avatar} The inner avatar aggregation
	 */
	Header.prototype._getAvatar = function () {
		var oAvatar = this.getAggregation("_avatar");
		if (!oAvatar) {
			oAvatar = new Avatar().addStyleClass("sapFCardIcon");
			this.setAggregation("_avatar", oAvatar);
		}
		return oAvatar;
	};

	/**
	 * Called before the control is rendered.
	 * @private
	 */
	Header.prototype.onBeforeRendering = function () {
		this._getTitle().setText(this.getTitle());
		this._getSubtitle().setText(this.getSubtitle());
		this._getAvatar().setDisplayShape(this.getIconDisplayShape());
		this._getAvatar().setSrc(this.getIconSrc());
		this._getAvatar().setInitials(this.getIconInitials());
	};

	/**
	 * Helper function used to create aria-labelledby attribute.
	 *
	 * @private
	 * @returns {string} IDs of controls
	 */
	Header.prototype._getHeaderAccessibility = function () {
		var sTitleId = this._getTitle() ? this._getTitle().getId() : "",
			sSubtitleId = this._getSubtitle() ? this._getSubtitle().getId() : "",
			sAvatarId = this._getAvatar() ? this._getAvatar().getId() : "";

		return sTitleId + " " + sSubtitleId + " " + sAvatarId;
	};

	/**
	 * Called after the control is rendered.
	 */
	Header.prototype.onAfterRendering = function() {
		//TODO performance will be afected, but text should clamp on IE also - TBD
		if (Device.browser.msie) {
			if (this.getTitle()) {
				this._getTitle().clampText();
			}
			if (this.getSubtitle()) {
				this._getSubtitle().clampText();
			}
		}
	};

	/**
	 * Fires the <code>sap.f.cards.Header</code> press event.
	 */
	Header.prototype.ontap = function () {
		this.firePress();
	};

	/**
	 * Creates an instance of Header with the given options.
	 *
	 * @private
	 * @static
	 * @param {Object} mConfiguration A map containing the header configuration options
	 * @param {Object} oServiceManager A service manager instance to handle services
	 * @return {sap.f.cards.Header} The created Header
	 */
	Header.create = function(mConfiguration, oServiceManager) {
		var mSettings = {
			title: mConfiguration.title,
			subtitle: mConfiguration.subTitle
		};

		if (mConfiguration.icon) {
			mSettings.iconSrc = mConfiguration.icon.src;
			mSettings.iconDisplayShape = mConfiguration.icon.shape;
			mSettings.iconInitials = mConfiguration.icon.text;
		}

		if (mConfiguration.status) {
			mSettings.statusText = mConfiguration.status.text;
		}

		var oHeader = new Header(mSettings);
		oHeader.setServiceManager(oServiceManager);
		oHeader._setData(mConfiguration.data);

		return oHeader;
	};

	Header.prototype.setServiceManager = function (oServiceManager) {
		this._oServiceManager = oServiceManager;
		return this;
	};

	/**
	 * Sets a data provider to the header.
	 *
	 * @private
	 * @param {object} oDataSettings The data settings
	 */
	Header.prototype._setData = function (oDataSettings) {
		var sPath = "/";
		if (oDataSettings && oDataSettings.path) {
			sPath = oDataSettings.path;
		}

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}

		this._oDataProvider = DataProviderFactory.create(oDataSettings, this._oServiceManager);

		if (this._oDataProvider) {
			this.setBusy(true);

			// If a data provider is created use an own model. Otherwise bind to the one propagated from the card.
			this.setModel(new JSONModel());

			this._oDataProvider.attachDataChanged(function (oEvent) {
				this._updateModel(oEvent.getParameter("data"));
				this.setBusy(false);
			}.bind(this));
			this._oDataProvider.attachError(function (oEvent) {
				this._handleError(oEvent.getParameter("message"));
				this.setBusy(false);
			}.bind(this));

			this._oDataProvider.triggerDataUpdate();
		}

		this.bindObject(sPath);
	};

	Header.prototype._updateModel = function (oData) {
		this.getModel().setData(oData);

		// Have to trigger _updated on the first onAfterRendering after _updateModel is called.
		setTimeout(function () {
			this.fireEvent("_updated");
		}.bind(this), 0);
	};

	Header.prototype._handleError = function (sLogMessage) {
		this.fireEvent("_error", { logMessage: sLogMessage });
	};

	ActionEnablement.enrich(Header);

	return Header;
});