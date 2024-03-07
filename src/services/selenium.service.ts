import { Injectable } from '@nestjs/common';
import { WebDriver, Builder, By, until } from 'selenium-webdriver';
import { StartAutomationDto } from 'src/modules/automation.dto';
import { Key } from 'webdriverio';
import { RestaurantService } from './restaurant.service';

@Injectable()
export class SeleniumService {
  private driver: WebDriver;

  constructor(private readonly restaurantService: RestaurantService) { }

  async runAutomation({ keyword, location }: StartAutomationDto) {
    this.driver = await new Builder().forBrowser('chrome').build();

    try {
      await this.driver.get('https://www.google.com'); // Navigate to Google
      await this.driver.manage().window().maximize();

      const searchInput = await this.driver.findElement(By.name('q'), 1000); // Find the search input

      await searchInput.sendKeys(`${keyword} in ${location}`, Key.Return); // Type and press Enter

      await this.driver.wait(until.titleContains(`${keyword} in ${location}`), 1000); // Wait for search

      const maxRetries = 1; // Maximum number of retries
      let retryCount = 0; // Number of times to retry on error
      let restartCount = 0; // Number of times to restart the process
      const restartAfter = 20; // Restart after processing this many restaurants

      // Click the first restaurant
      const firstButton = await this.driver.findElement(By.className('Z4Cazf OSrXXb'));
      await firstButton.click();
      await this.driver.sleep(2000);

      const processedRestaurantNames: string[] = [];
      // Click on the details button for each restaurant
      for (let i = 0; i < 20; i++) { // 100 is an arbitrary large number to demonstrate the logic
        try {
          const detailsButtons = await this.driver.findElements(By.css('div.rllt__details'));
          if (i < detailsButtons.length) {
            const restaurantElement = detailsButtons[i];
            await restaurantElement.click();
            console.log([i + 1]);

            // Wait for the restaurant details to load
            await this.driver.wait(until.elementLocated(By.css('h2.qrShPb')), 20000);

            // Extract restaurant details
            const restaurantNameElement = await this.driver.findElement(By.css('h2.qrShPb'));
            const restaurantName = await restaurantNameElement.getText().catch(() => null);

            if (restaurantName && !processedRestaurantNames.includes(restaurantName)) {

              // Add the restaurant name to the processed array
              processedRestaurantNames.push(restaurantName);

              const addressClass = await this.driver.findElement(By.css('.LrzXr'));
              const restaurantAddress = await addressClass.getText().catch(() => null);

              let phoneNumber = null;
              try {
                const phoneNumberElement = await this.driver.findElement(
                  By.xpath('//span[contains(@aria-label, "Call phone number")]')
                );
                const rawPhoneNumber = await phoneNumberElement.getText();
                phoneNumber = rawPhoneNumber ? rawPhoneNumber.replace(/\D/g, '') : null;
              } catch (phoneError) {
                console.log('Phone number not found for', restaurantName);
              }

              const ratingElement = await this.driver.findElement(By.css('div.TLYLSe.MaBy9 span.yi40Hd.YrbPuc'));
              const rawRating = await ratingElement.getText();
              const rating = rawRating ? parseFloat(rawRating) : null;

              // Print restaurant details in the console
              console.log('Restaurant Name:', restaurantName);
              console.log('Restaurant Address:', restaurantAddress);
              console.log('Phone Number:', phoneNumber);
              console.log('Rating:', rating);

              // Save the data to the database
              await this.restaurantService.create({
                name: restaurantName ? restaurantName.trim() : null,
                address: restaurantAddress,
                mobile: phoneNumber,
                rating: rating,
              });
            } else {
              console.log(`Skipping duplicate restaurant: ${restaurantName}`);
            }

            // Wait for the page to load
            await this.driver.sleep(2900);
            // Check if it's time to click the element and restart
            if (++restartCount >= restartAfter) {
              restartCount = 0;
              console.log('Restarting...');
              console.log('Restart Count:', restartCount);

              // Reset the index to start processing elements on the new page
              i = -1;

              const nextButton = await this.driver.findElement(By.css('a.fl[aria-label]'));
              await this.driver.wait(until.elementIsVisible(nextButton), 5000);
              await nextButton.click();
              console.log('Clicked on Next button');
              // Wait for the page to refresh
              await this.driver.wait(until.stalenessOf(nextButton), 5000);

              // Wait for the new page to load
              await this.driver.wait(until.elementLocated(By.css('div.rllt__details')), 20000);
              await this.driver.sleep(2000); // Wait for the page to load after clicking
              continue; // Skip processing elements on the current page
            }
            // restartCount = restartAfter; // Force a restart to move to the next page
            continue;
          } else {
            console.log(`Not enough details buttons for restaurant ${i + 1}`);
          }
        } catch (error) {
          console.error(`Error during automation for restaurant ${i + 1}:`, error);
          retryCount++;
          if (retryCount <= maxRetries) {
            console.log(`Retrying (${retryCount}/${maxRetries})...`);
            i--; // Retry the same element in the next iteration
            await this.driver.sleep(2000); // Wait before retrying
            continue;
          }
        }
      }
    } catch (error) {
      console.error('Error during automation:', error);
    } finally {
      // Close the browser
      if (this.driver) {
        // await this.driver.quit();
      }
    }
  }
}
