import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:5173/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Signup' link in the header to open the registration page.
        # Signup link
        elem = page.get_by_role("navigation").get_by_role("link", name="Signup")
        await elem.click(timeout=10000)
        
        # -> Select the 'Company' role on the signup form so the page can reveal company-specific registration fields.
        # Company button
        elem = page.get_by_role("button", name="Company")
        await elem.click(timeout=10000)
        
        # -> Fill the Email Address, Mobile Number, Password, and Confirm Password fields on the signup form.
        # Email Address email field
        elem = page.get_by_role("textbox", name="Email Address")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("company.user+acme@example.com")
        
        # -> Fill the Email Address, Mobile Number, Password, and Confirm Password fields on the signup form.
        # Mobile Number tel field
        elem = page.get_by_role("textbox", name="Mobile Number")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("9999999999")
        
        # -> Fill the Email Address, Mobile Number, Password, and Confirm Password fields on the signup form.
        # Password password field
        elem = page.get_by_role("textbox", name="Password", exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Password123!")
        
        # -> Fill the Email Address, Mobile Number, Password, and Confirm Password fields on the signup form.
        # Confirm Password password field
        elem = page.get_by_role("textbox", name="Confirm Password")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Password123!")
        
        # -> Fill 'Company Name', 'Company Email (contact email)', and 'Company Location (e.g. Mumbai, India)' with valid values and click the 'Sign Up' button.
        # Company Name text field
        elem = page.get_by_role("textbox", name="Company Name")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Acme Corp")
        
        # -> Fill 'Company Name', 'Company Email (contact email)', and 'Company Location (e.g. Mumbai, India)' with valid values and click the 'Sign Up' button.
        # Company Email (contact email) email field
        elem = page.get_by_role("textbox", name="Company Email (contact email)")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("contact@acme.example.com")
        
        # -> Fill 'Company Name', 'Company Email (contact email)', and 'Company Location (e.g. Mumbai, India)' with valid values and click the 'Sign Up' button.
        # Company Location (e.g. Mumbai, India) text field
        elem = page.get_by_role("textbox", name="Company Location (e.g. Mumbai")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Mumbai, India")
        
        # -> Fill 'Company Name', 'Company Email (contact email)', and 'Company Location (e.g. Mumbai, India)' with valid values and click the 'Sign Up' button.
        # Sign Up button
        elem = page.get_by_role("button", name="Sign Up")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The app redirected to the login page (URL contains '/login').
        # Assert-outcome: passed
        # Assert: URL contains '/login' confirming navigation to the login page.
        await expect(page).to_have_url(re.compile("/login"), timeout=15000), "URL contains '/login' confirming navigation to the login page."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    