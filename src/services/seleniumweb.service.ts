import { Injectable } from '@nestjs/common';
import { WebDriver, Builder, By, until, Key } from 'selenium-webdriver';
import { StartAutomationDto } from 'src/modules/automation.dto';
import { RestaurantService } from './restaurant.service';

@Injectable()
export class SeleniumWebService {
    private driver: WebDriver;

    constructor(private readonly restaurantService: RestaurantService) { }

    async runAutomation({ keyword, location }: StartAutomationDto) {
        this.driver = await new Builder().forBrowser('chrome').build();

        try {
            await this.driver.get('https://www.google.com');
            await this.driver.get(`https://www.google.com/maps/@21.2232983,72.8672158,14z?entry=ttu`);
            await this.driver.manage().window().maximize();

            const searchInput = await this.driver.findElement(By.name('q'), 1000);
            await searchInput.sendKeys(`${keyword} in ${location}`, Key.RETURN);

            await this.driver.wait(until.titleContains(`${keyword} in ${location}`), 2000);
            await this.driver.sleep(2000);

            // Pressing Enter again to perform the search
            await searchInput.sendKeys(Key.RETURN);
            await this.driver.sleep(4000)
            
            const processedRestaurantNames: string[] = [];
            for (let i = 0; i < 500; i++) {
                try {
                    // Use findElements instead of `findElement` to get a list of elements
                    const elements = await this.driver.findElements(By.css('a.hfpxzc'));

                    if (i < elements.length) {
                        const currentElement = elements[i];
                        await this.driver.sleep(1500)
                        await currentElement.click();
                        await this.driver.sleep(1500)

                        // Scroll to the element
                        await this.driver.executeScript('arguments[0].scrollIntoView()', currentElement);
                        console.log([i + 1]);
                        // Wait for the restaurant details to load
                        await this.driver.wait(until.elementLocated(By.css('h1.DUwDvf.lfPIob')), 2000);

                        // Restaurant name
                        const restaurantNameElement = await this.driver.findElement(By.css('h1.DUwDvf.lfPIob'));
                        const restaurantName = await restaurantNameElement.getText();

                        if (restaurantName && !processedRestaurantNames.includes(restaurantName)) {
                            processedRestaurantNames.push(restaurantName);

                            // Use `findElements` for multiple elements
                            const io6YTeElements = await this.driver.findElements(By.className('Io6YTe'));
                            const mobileNumbers: string[] = []; // Move this line outside the loop
                            let address: string = '';
                            let mobileNumberFound = false;
                            for (const io6YTeElement of io6YTeElements) {
                                const io6YTeText = await io6YTeElement.getText();

                                const mobileNumbersMatch = io6YTeText.match(/(\d[ -]?){10,}/g);
                                if (mobileNumbersMatch) {
                                    const mobileNumber = mobileNumbersMatch[0].replace(/\D/g, '');
                                    console.log('Mobile Numbers:', mobileNumber);
                                    mobileNumbers.push(mobileNumber);
                                    mobileNumberFound = true;  // Set the flag to true
                                }
                                // Capture the address line
                                if (io6YTeText.includes('Gujarat ')) {
                                    address = io6YTeText.trim();
                                }
                            }
                            // Log "Mobile Numbers: null" if no mobile numbers were found
                            if (!mobileNumberFound) {
                                console.log('Mobile Numbers: null');
                            }

                            // Rating
                            let rating = null; // Default to null
                            try {
                                const ratingElement = await this.driver.wait(
                                    until.elementLocated(By.css('div.F7nice span[aria-hidden="true"]')), 2000); // Adjust the timeout as needed

                                const rawRating = await ratingElement.getText();
                                rating = rawRating ? parseFloat(rawRating) : null;
                            } catch (error) {
                                // console.log('Rating: null'); // Log 'Rating: null' when the element is not found
                            }

                            console.log('Restaurant Name:', restaurantName);
                            console.log('Restaurant Address:', address);
                            // console.log('Phone Number:', rawRating);
                            console.log('Rating:', rating);

                            // Save the data to the database
                            await this.restaurantService.create({
                                name: restaurantName ? restaurantName.trim() : null,
                                address: address,
                                mobile: mobileNumbers.join(', '), // Join mobile numbers into a string
                                rating: rating,
                            });
                        } else {
                            console.log(`Skipping duplicate restaurant: ${restaurantName}`);
                        }
                    } else {
                        console.error('Current element is null. Skipping...');
                        i = i - 6;  // click to back 6th element to stop reloading
                        // Continue to the next iteration
                        continue;
                    }
                    await this.driver.sleep(1000);
                } catch (error) {
                    console.error(`Error in iteration ${i + 1}: ${error.message}`);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            if (this.driver) {
                // await this.driver.quit();
            }
        }
    }
}
