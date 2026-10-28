# Store assets

Images for the App Store and Google Play listings. All screenshots show the
Software Engineering collection on the production site, with a 9:41 status bar.

| Folder                                          | Size      | Upload to                                                          |
| ----------------------------------------------- | --------- | ------------------------------------------------------------------ |
| `ios/icon-1024.png`                             | 1024×1024 | App Store Connect, app icon (no transparency)                      |
| `ios/iphone-6.3/`                               | 1206×2622 | App Store Connect, iPhone 6.1" / 6.3" screenshots                  |
| `ios/iphone-6.9/`                               | 1320×2868 | App Store Connect, iPhone 6.9" screenshots                         |
| `ios/product-page/header-3840x1646.png`         | 3840×1646 | App Store Connect, Header                                          |
| `ios/product-page/search-results-3840x2560.png` | 3840×2560 | App Store Connect, Search Results                                  |
| `ios/ipad-13/`                                  | 2064×2752 | App Store Connect, iPad 13" screenshots                            |
| `android/listing/`                              | see names | Play Console, store listing: 512 icon and 1024×500 feature graphic |
| `android/phone/`                                | 1080×2160 | Play Console, phone screenshots                                    |

App Store Connect takes up to 10 screenshots per device size, Play takes 2 to 8
per device type. Files are numbered in the order they should appear. `01b` is a
second Home shot (streak open), `03a`/`03b` are the Review card front and back,
and `04b-quiz-choice.png` is an alternate Quiz question for iPhone.

## Notes

- Every image is flat RGB, which both stores require.
- The iPad shots have the account email blurred and the iPadOS window handle
  painted out.
- Android is 1080×2160 because Play rejects screenshots whose longer side is more
  than twice the shorter one.
- Stories shows the audio control without playing; no narration was started.
- Retake after any visible UI change. The app loads the live site, so new
  screenshots need no store release.
