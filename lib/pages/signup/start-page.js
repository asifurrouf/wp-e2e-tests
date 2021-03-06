import { By } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../../base-container';
import * as dataHelper from '../../data-helper';

export default class StartPage extends BaseContainer {
	constructor( driver, { visit = true, culture = 'en', personalPlanSetting = 'hide', flow = '' } = {} ) {
		let url;
		if ( visit === true ) {
			url = config.get( 'calypsoBaseURL' ) + '/start';

			if ( flow !== '' ) {
				url += '/' + flow;
			}

			if ( culture !== 'en' ) {
				url += '/' + culture;
			}

			if ( dataHelper.isRunningOnLiveBranch() ) {
				url = url + '?branch=' + config.get( 'branchName' );
			}
		} else {
			url = driver.getCurrentUrl().then( ( urlDisplayed ) => {
				return urlDisplayed;
			} );
		}

		let ABTestControlFlow = flow !== '' ? flow : 'main';

		super( driver, By.css( '.step-wrapper' ), visit, url );
		this.checkForUnknownABTestKeys();
		this.setABTestControlGroupsInLocalStorage( url, culture, ABTestControlFlow );
	}
}
