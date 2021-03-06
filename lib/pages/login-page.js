import { By } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';
import * as dataHelper from '../data-helper';
import * as slackNotifier from '../slack-notifier.js';

export default class LoginPage extends BaseContainer {
	constructor( driver, visit, overrideURL ) {
		let loginURL = LoginPage.getLoginURL();

		if ( typeof overrideURL === 'string' ) {
			loginURL = overrideURL;
		}

		super( driver, By.css( '#loginform, .wp-login__container' ), visit, loginURL );
	}

	login( username, password ) {
		const driver = this.driver;
		const userNameSelector = By.css( '#user_login, #usernameOrEmail' );
		const passwordSelector = By.css( '#user_pass, #password' );
		const submitSelector = By.css( '#wp-submit, button[type="submit"]' );
		const explicitWaitMS = this.explicitWaitMS;

		driverHelper.setWhenSettable( driver, userNameSelector, username );
		driverHelper.setWhenSettable( driver, passwordSelector, password, { secureValue: true } );
		driverHelper.clickWhenClickable( driver, submitSelector );
		return driver.wait( function() {
			return driverHelper.isElementPresent( driver, userNameSelector ).then( function( present ) {
				return !present;
			} );
		}, explicitWaitMS * 2 ).then( () => {}, ( error ) => {
			const message = `Found issue on login page: '${error}' - Trying to log in again now.`;
			slackNotifier.warn( message );
			driverHelper.setWhenSettable( driver, userNameSelector, username );
			driverHelper.setWhenSettable( driver, passwordSelector, password, { secureValue: true } );
			driverHelper.clickWhenClickable( driver, submitSelector );
			return driver.wait( function() {
				return driverHelper.isElementPresent( driver, userNameSelector ).then( function( present ) {
					return !present;
				} );
			}, explicitWaitMS, 'The login page is still showing after trying to log in for a second time' );
		} );
	}

	static getLoginURL() {
		const baseURL = config.get( 'calypsoBaseURL' );
		let loginURL = `${baseURL}/log-in`;

		// If we're using a live branch - we need to reload the root page with the branch name
		if ( dataHelper.isRunningOnLiveBranch() ) {
			loginURL = loginURL + '?branch=' + config.get( 'branchName' );
		}

		return loginURL;
	}
}
