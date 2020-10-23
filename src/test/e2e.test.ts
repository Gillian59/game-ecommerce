import { openBrowser, closeBrowser, goto, text, click, waitFor, scrollDown, scrollUp, link } from "taiko";

describe("Test d'accessibilité", () => {
  jest.setTimeout(500000);

  beforeAll(async () => {
    await openBrowser({
      args: [
        "--window-size=1280,800",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-first-run",
        "--no-sandbox",
        "--no-zygote",
      ],
      headless: false, //permet d'avoir un visuel graphique sur les tests//
    });
  });
  afterAll(async () => {
    await closeBrowser();
  });
  test("Chargement du Browser", async () => {
    //test open browser + click Games
    expect.assertions(1);
    const website = process.env.URL || "";
    await goto(website);

    await scrollDown("©");
    expect(await text("©").exists()).toBeTruthy();
    await waitFor("©");
  }),
    test("Carousel Home", async () => {
      expect.assertions(1);
      await scrollUp("Next");
      expect(await text("Next").exists()).toBeTruthy();
      await click(link("Next"));
      await click(link("Next"));
      await click(link("Next"));
      await click(link("Next"));
      await click(link("Next"));
      await click(link("Previous"));
    });

  /* TEST GAMES */
  test("Games", async () => {
    expect.assertions(5);
    await scrollUp("Games");
    expect(await text("Games").exists()).toBeTruthy();
    await click(link("Games"));

    await scrollDown("©");
    expect(await text("©").exists()).toBeTruthy();
    await waitFor("©");

    await scrollUp("Minecraft");
    await waitFor("Minecraft");
    expect(await text("Minecraft").exists()).toBeTruthy();
    await click(link("Minecraft"));

    await scrollDown("©");
    expect(await text("©").exists()).toBeTruthy();
    await waitFor("©");

    await scrollUp("Next");
    await waitFor("Next");
    expect(await text("Next").exists()).toBeTruthy();
    await click(link("Next"));
    await waitFor("Previous");
    await click(link("Previous"));
  });
  /* TEST PLATFORM via un jeu */
  test("Platform Switch via un jeu", async () => {
    expect.assertions(4);
    await scrollUp("Nintendo Switch");
    expect(await text("Nintendo Switch").exists()).toBeTruthy();
    await waitFor("Nintendo Switch");
    await click(link("Nintendo Switch"));

    await scrollDown("©");
    expect(await text("©").exists()).toBeTruthy();
    await waitFor("©");

    await scrollUp("Minecraft");
    expect(await text("Minecraft").exists()).toBeTruthy();
    await waitFor("Minecraft");
    await click(link("Minecraft"));

    await scrollDown("©");
    expect(await text("©").exists()).toBeTruthy();
    await waitFor("©");
  });

  test("Platform PlayStation 4 via un jeu", async () => {
    expect.assertions(4);
    await scrollUp("PlayStation 4");
    expect(await text("PlayStation 4").exists()).toBeTruthy();
    await waitFor("PlayStation 4");
    await click(link("PlayStation 4"));

    await scrollDown("©");
    expect(await text("©").exists()).toBeTruthy();
    await waitFor("©");

    await scrollUp("Minecraft");
    expect(await text("Minecraft").exists()).toBeTruthy();
    await waitFor("Minecraft");
    await click(link("Minecraft"));

    await scrollDown("©");
    expect(await text("©").exists()).toBeTruthy();
    await waitFor("©");
  }),
    test("Platform Xbox 360 via un jeu", async () => {
      expect.assertions(3);
      await scrollUp("Xbox 360");
      expect(await text("Xbox 360").exists()).toBeTruthy();
      await click(link("Xbox 360"));
      await waitFor("Xbox 360");

      await scrollDown("©");
      expect(await text("©").exists()).toBeTruthy();
      await waitFor("©");

      await scrollUp("Minecraft");
      expect(await text("Minecraft").exists()).toBeTruthy();
      await waitFor("Minecraft");
      await click(link("Minecraft"));
    }),
    /* Test Affichage Platforms (PS4 SWITCH XBOX360) */
    test("Affichage de la Page Platforms", async () => {
      expect.assertions(5);
      await scrollUp("Platforms");
      expect(await text("Platforms").exists()).toBeTruthy();
      await click(link("Platforms"));

      await scrollDown("©");
      expect(await text("©").exists()).toBeTruthy();
      await waitFor("©");

      await scrollUp("Nintendo Switch");
      expect(await text("Nintendo Switch").exists()).toBeTruthy();
      await click("Nintendo Switch");
      expect(await text("Xbox 360").exists()).toBeTruthy();
      await click("Xbox 360");
      expect(await text("PlayStation 4").exists()).toBeTruthy();
      await click("PlayStation 4");
    });
});
