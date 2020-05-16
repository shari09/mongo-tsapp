# mongo-tsapp
Tsapp built on top of Kevin's idea (more like it *is* his idea). But like I rewrote all the scraping code scraping in my own way (regex was so much painnnn :tired_face: ) and changed everything (concept still the same). 
  - ok it still doesn't scrap for other/culminating cuz even when I look at it with my eyes I don't know if they should belong to other or final strand

Basically a TeachAssist app with a semi-decent UI (well, to me it is but since I'm the creator I'm probably biased :sweat_smile:) and notifications service 
 - featuring MongoDb and FCM for notifications


__Experience:__
-
- Building the react native app was a HUGE pain but I like how it turned out :))
- MongoDB Stitch is really easy to work with and more efficient than firestore in terms of querying and way more prize friendly (FREEEEE)
- mongo serverless function was uhhhhhhhhhhhhhhhhh (doesn't support some useful es6 features and you pretty much have to use their online editor cuz stitch-cli is very :thinking:)
- well, mongodb functions and their sdk worked well together, more convenient than firebase

__Todo:__
 -  
 - actually write rules to db to not every user can just write and read everything
 - add better db indexes
 - add notif displaying image of assessment details (strands) when notif is non-collapsed
 -  add function to calculate course avg if a new mark is entered (like what my avg will be if I got this in xx and that in xxx, or like a exam mark needed to pass calculator :pp)
 - maybe fix up my poor design (I might still have some small memory leaks aka callbacks on unmounted components)
 - maybe add scraping for my weird chem mark, ok I'll probably do that now
 - :grin: :smile: :wink:

![assessments ](https://lh3.googleusercontent.com/XLccx33Q_yD8Gegb48FU0l8E4GA9A3j5IK2VK8d6_BM_styJHiYxbAtekTKk4xLW-t9Rwy7htOaRqaB9v9fiSsrWV7pycZ8BeSWZ5wZjxC7hJElY_7qKM5JuKW5SXIEX1LqFnhOgv8B09i84kTDjokMzAQiB5SGtntCD_BEuA1xOrFnN1F57SIJxcZ7t9QjXnrGQVPTCYdtSDVTe3S9Rb9tl4JBnoHNPntOJ2-mvjfhBO2DB-rb3uE2WH0nJFsrjFe39EZlkIAB1SSqTWhGP6wZ16xIzYFuMlM-N43azeq3n8WZsF0fTmorAvz7HaKTguYi0VNjHJRL1sbXWFNqe1znP4SqJOo0aTtX9dKU6wsJEIrVz5FCCzJZE4T14dBPbRhWmoS9OqQ_2OSXjnm1hz0YEqnpgWYSAV88KJkH9CNNEB9m34SMw2WG2Z8XNHjfauh-FtUFFQWwf9OktcCVxRu3tz5B5o1XaEl36QzxbgxoruUBfEJFsTfeGIJy3XeOMXxYypqZlA533h0740is95-sOwYOJYXm9QlZaS6flTV-_lVi_Mt0ZbYc1VmQSxn6yZ2tTyVD0HFWt8FRfKDGOQplaSFIm614DCkH9-PNqWUOmuoJiBzXjB8OVtQtEzExN0oxRYk6g7Xr56IDI3AmsfrlI2qnsOazgDSM1AIpBoCn745G5zOFa9_OFw3j96w=w436-h904-no?authuser=0 =200x) ![sdf](https://lh3.googleusercontent.com/TfCoiJz2DS_8CCEgKcwrXLo1sDJCF_lfNlZqpblt_gpZLU7M7CW2yT0iJ3n299Xf6C2wM9fJ15z1Ve16tUV3KdR9krgIpNyha7Hr-82wYnmpMkOWCCnTetWf12VBpMPl0T4xRFwI5ilcC5MjjNSyfymwSBRoTmJBU7qXeMmBzkocYD7BRmTAaZpcNtLvSHrFJ2jx2c0YMfRrG19TvkwBuG8sYN_LSeNOE4EQ9sphuMYdUbg1OVprpTeG-hl9v-ydcKRT0wd7vxSz91T8BKnMrQ_hh_JLllVQR7QNWyZc1XQCCgQCZ0V6079JyPfRgyc9jBFieA33FQguOsD0xn2BrV8buaDqvzxtkJuxBSb0utj5NHxtJegMchSCRiIfM5U25ozgKpdlYL8bURShbqOlydcyfYp1LlSC7F6rPq0XNMJlLSz1nBfLAIOmK44Vj8AOd4-y8PgswALHEG9N2lMarH8RRXiYP6rHA_6nyD6nmgW3ns4pWWU0mM1KA3WGIEihy0bf75Zv-WFPbjbqcvNVfakQqH8-BPN9yiQY27vy8STYJlTGItuey40ERpyi-TLYSSoSPV8YvxmuNsmiCmx26Bpc-WsjzuZMlK_q3jQbK93lMpXmdpcTneX7VO7wZCGMcXO0RllwlXy9CBr-UTY9P9thgFJsAhSVS-Kq5uODTVm8-A_FOsCKs74eN_efSw=w270-h890-no?authuser=0 =200x) ![](https://lh3.googleusercontent.com/06ZYpEUVsHdk6M5uMfx8niOtAoCf0piviPsofDL0A4HMANIyvuLgkRsRDLFBAwkxM32mJSf_vk8KeCIs3mHlNxW6XasZ7rNvYu7luHkR-QjO08gC5w9SdshjqEUQrnc1bDOlsUIBg0C1eLy1z8NUGYF6SAWYt9IwmGslK8PiEhxxkioHNq8HIRsrzPDQEn5f9HzSVpVRX--z7n1xO6RSo64Gfd219an-K-rOtAUA26hz6SF1zErXwq_pcszYPhCH0KQrLSNt1MNH7n7KXMXuSSyaeIqyDvy9z04yFPkbgtSzwAD2I0BaOhTJWjeHySZdR4RRT-KhyeOoc8bkaY6CfEOFoxx5Fe_KTLK-XxO-WZ-ubtWjdVFkV9wHLpcQFnWHj_WmcCMA5vIJ_t6boPM87qv25n228Yocpq6ryH4Jtvbic0sMP7Wlf8wxa8W0hRFvltkSg_kDFPXMXe2RkMvZar9UK4W4U-xcBgrlsJTsCJ1FnYvIDPn9GeovdCJCah12j2x6O80ykTf03jE3RTgINCJcpRMHIQIW4_tdEqX_mNug50C3_-udwbRlpkmbJimf0x1jjLov09iyN9pSPhBzh1GFajNrDK_a5ePYWtu1xch67DipmOIn47-bqwVaIEwGh4-ikN7745Q0msXre7fTuRGSM_HH5ZJJEJWCVy8cgzRq9_rCmgxqLbJq4kEhyQ=w429-h890-no?authuser=0 =200x) ![](https://lh3.googleusercontent.com/fZxwhGrLuOe1eCu2qyFOaTOZt_UQatM4bcVkePWB5dMqGX1NMzImaxZRWFfaiUe5_2MaQEwETXnay11ZZY26bw8bomLuwyO9PXVM04xuZfDhFM-zXex0DtOxdQ_nm1nDgxp0Xd_oDKyRlFWQbokCS4Uo3njJkPkbPP30mdov_pBzNh10W6Jnbmwe5ay7lCVUg51-5QaBP2W5jDD8hetmAQEU0qi9a-Cl5ZVVRG9jizfyFNfuh7QRfAULaZKXKcHfA_VaI7TQLNad7QpIafVJNmDDZN-iqbVtcXyRAdj5lRAQ__rGdzYrQQpRd9xbZoJQvWiRYnd1NQplbqMVuBdWv7UBC9GVhqf3Hx70t-9DCX3tYWWUd0cssKRvnuBvSoCbAJRcM-_AkECBaHVifyrBLL_kewOpg97jb8NgZLpri7e4ArhzBTzEFDU1EhjJVjfhw85uzkBgTLGxhuos7b9tsVwaD7age8wlZkOTb0Awq-IduhEHQuP-j8tKefklVuPGs0Y4_2-u85814tb-6mlVp134tUOxr42JqdBbiXa95u1_CKXN7a6fTmv8hBTNJntABcdB8wF6RasOYAOzsSavSTQwsQHoGNO2XNeiFXtAXggbwgZA1f2oakyNCbnWmK9s6kkYMlja79v4dZWXsO8UKC0qCNfV7Ego-VdTNPRQCQpLQ7BU8gRCbih6lPEPzQ=w429-h890-no?authuser=0 =200x) 



*contribute to open source* :smirk: 
