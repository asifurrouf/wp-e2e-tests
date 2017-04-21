import webdriver from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container.js';

const by = webdriver.By;

export default class AddProductPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = config.get( 'calypsoBaseURL' ) + '/store/products/add';
		super( driver, by.css( '.woocommerce.products__form' ), visit, url );
	}
}