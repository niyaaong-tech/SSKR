/* 주차 지점과 이륜차 도로 접근, 실제 장소 사진을 대조한 공용 카탈로그 보강. */
(function(root){
  const data = {
  "removedIds": [
    "abai-village",
    "allride",
    "aviation-museum",
    "baekseoktan",
    "bangdong-spring",
    "bunhwangsa",
    "buryeongsa",
    "cafe-299",
    "cafe-sann",
    "changwon-house",
    "cheonjangho",
    "daecheon-market",
    "daegwallyeong",
    "daksil",
    "damyang-market",
    "domaryeong-viewpoint",
    "donghae-market",
    "g-rider",
    "gangcheonsan",
    "gangneung-seongyojang",
    "gongju-market",
    "gubongsan-observatory",
    "gyeongcheondae",
    "gyeonggijeon",
    "gyeongju-gyochon",
    "hapcheon-film-park",
    "harleywood",
    "hoeryongpo",
    "hongseong-sky-tower",
    "hue-cafe-138",
    "huinnyeoul",
    "hwasun-red-cliff",
    "hwawangsan",
    "hwayang",
    "imgo",
    "jeokbyeokgang",
    "jinju-market",
    "junam-reservoir",
    "jusanji",
    "kim-satgat-museum",
    "maltijae",
    "mokpo-literature-museum",
    "muryangsa",
    "museom",
    "namaste",
    "neumanjang",
    "okjeongho",
    "rc79",
    "rest-garden",
    "road-runner",
    "route7",
    "royce",
    "rpm-moto",
    "sabuk-coal-village",
    "sanmagi",
    "seondol",
    "seongjusa",
    "sokcho-joyang-site",
    "two-stroke",
    "uirim-museum",
    "upo-wetland",
    "walking-stone",
    "yeongwol-market"
  ],
  "parkingById": {
    "sokcho": {
      "lat": 38.18743167,
      "lng": 128.6052197,
      "osm": "https://www.openstreetmap.org/way/178808349",
      "distanceToPlaceMeters": 83,
      "evidence": "속초시 해수욕장 공영주차장 목록과 OSM amenity=parking; 이륜차 도로 접근 확인 2026-09-28"
    },
    "auraji": {
      "lat": 37.4766764,
      "lng": 128.7219016,
      "osm": "https://www.openstreetmap.org/way/1196258522",
      "distanceToPlaceMeters": 708,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "cheongnyeongpo": {
      "lat": 37.1787948,
      "lng": 128.4456095,
      "osm": "https://www.openstreetmap.org/way/1256468454",
      "distanceToPlaceMeters": 95,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "dodam": {
      "lat": 37.00097,
      "lng": 128.3423232,
      "osm": "https://www.openstreetmap.org/way/1137780442",
      "distanceToPlaceMeters": 261,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "cheongpung": {
      "lat": 37.0023605,
      "lng": 128.1698561,
      "osm": "https://www.openstreetmap.org/way/1084230297",
      "distanceToPlaceMeters": 152,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "sujupalbong": {
      "lat": 36.8978035,
      "lng": 127.9247746,
      "osm": "https://www.openstreetmap.org/way/1437075215",
      "distanceToPlaceMeters": 291,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "buncheon": {
      "lat": 36.9329228,
      "lng": 129.0589944,
      "osm": "https://www.openstreetmap.org/way/1089865955",
      "distanceToPlaceMeters": 386,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "mungyeong": {
      "lat": 36.7606669,
      "lng": 128.0762002,
      "osm": "https://www.openstreetmap.org/way/175945639",
      "distanceToPlaceMeters": 149,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "gaeun": {
      "lat": 36.6490193,
      "lng": 128.06083,
      "osm": "https://www.openstreetmap.org/way/1545943899",
      "distanceToPlaceMeters": 563,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "munui": {
      "lat": 36.5100823,
      "lng": 127.4941546,
      "osm": "https://www.openstreetmap.org/way/1167735476",
      "distanceToPlaceMeters": 104,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "hahoe": {
      "lat": 36.5450777,
      "lng": 128.5182682,
      "osm": "https://www.openstreetmap.org/way/1368603666",
      "distanceToPlaceMeters": 679,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "hwabon": {
      "lat": 36.1229121,
      "lng": 128.6948227,
      "osm": "https://www.openstreetmap.org/way/1155412249",
      "distanceToPlaceMeters": 122,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "jikjisa": {
      "lat": 36.1166701,
      "lng": 128.0060236,
      "osm": "https://www.openstreetmap.org/way/1346504187",
      "distanceToPlaceMeters": 37,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "wollyubong": {
      "lat": 36.2341037,
      "lng": 127.8891704,
      "osm": "https://www.openstreetmap.org/way/1268561421",
      "distanceToPlaceMeters": 568,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "magoksa": {
      "lat": 36.5566647,
      "lng": 127.0120182,
      "osm": "https://www.openstreetmap.org/way/899425051",
      "distanceToPlaceMeters": 37,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "baekje": {
      "lat": 36.3072529,
      "lng": 126.9005605,
      "osm": "https://www.openstreetmap.org/way/821070354",
      "distanceToPlaceMeters": 153,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "the-road-1423": {
      "lat": 37.2685914,
      "lng": 128.2691074,
      "osm": "https://www.openstreetmap.org/way/639997839",
      "distanceToPlaceMeters": 175,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "road-66": {
      "lat": 37.16328,
      "lng": 128.9861292,
      "osm": "https://www.openstreetmap.org/way/471836194",
      "distanceToPlaceMeters": 501,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "bikongs": {
      "lat": 36.3596468,
      "lng": 127.2442431,
      "osm": "https://www.openstreetmap.org/way/1257122820",
      "distanceToPlaceMeters": 517,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "hichichi": {
      "lat": 36.8911382,
      "lng": 126.8207123,
      "osm": "https://www.openstreetmap.org/way/1041691217",
      "distanceToPlaceMeters": 142,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "mad-brown": {
      "lat": 36.099968,
      "lng": 128.3257734,
      "osm": "https://www.openstreetmap.org/way/940253376",
      "distanceToPlaceMeters": 380,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "hwasodam": {
      "lat": 35.675305,
      "lng": 129.463043,
      "osm": "https://www.openstreetmap.org/way/1515184183",
      "distanceToPlaceMeters": 651,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "gangneung-market": {
      "lat": 37.7533873,
      "lng": 128.9014507,
      "osm": "https://www.openstreetmap.org/way/1462637590",
      "distanceToPlaceMeters": 256,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "jumunjin-market": {
      "lat": 37.8904123,
      "lng": 128.8287503,
      "osm": "https://www.openstreetmap.org/node/6761013567",
      "distanceToPlaceMeters": 128,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "donghae-market": {
      "lat": 37.5508372,
      "lng": 129.1111696,
      "osm": "https://www.openstreetmap.org/way/940379310",
      "distanceToPlaceMeters": 193,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "bukpyeong-market": {
      "lat": 37.4837211,
      "lng": 129.1262478,
      "osm": "https://www.openstreetmap.org/node/7800113861",
      "distanceToPlaceMeters": 133,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "jeongseon-market": {
      "lat": 37.3797479,
      "lng": 128.6649881,
      "osm": "https://www.openstreetmap.org/way/839684793",
      "distanceToPlaceMeters": 94,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "bongpyeong-market": {
      "lat": 37.6154678,
      "lng": 128.3758804,
      "osm": "https://www.openstreetmap.org/way/976946525",
      "distanceToPlaceMeters": 126,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "yeongwol-market": {
      "lat": 37.1812696,
      "lng": 128.4652129,
      "osm": "https://www.openstreetmap.org/way/1528001130",
      "distanceToPlaceMeters": 193,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "danyang-market": {
      "lat": 36.9822601,
      "lng": 128.3711366,
      "osm": "https://www.openstreetmap.org/node/10723370955",
      "distanceToPlaceMeters": 118,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "jecheon-market": {
      "lat": 37.1284264,
      "lng": 128.2058455,
      "osm": "https://www.openstreetmap.org/way/953702821",
      "distanceToPlaceMeters": 148,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "goesan-market": {
      "lat": 36.8148873,
      "lng": 127.794453,
      "osm": "https://www.openstreetmap.org/way/1535732776",
      "distanceToPlaceMeters": 419,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "uljin-market": {
      "lat": 36.9927652,
      "lng": 129.4035375,
      "osm": "https://www.openstreetmap.org/way/1144271354",
      "distanceToPlaceMeters": 363,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "yeongdeok-market": {
      "lat": 36.4065979,
      "lng": 129.3696985,
      "osm": "https://www.openstreetmap.org/way/1291055405",
      "distanceToPlaceMeters": 18,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "gampo-market": {
      "lat": 35.8037524,
      "lng": 129.5016169,
      "osm": "https://www.openstreetmap.org/way/1500640484",
      "distanceToPlaceMeters": 59,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "yeongju-market": {
      "lat": 36.8243049,
      "lng": 128.6238891,
      "osm": "https://www.openstreetmap.org/way/316659418",
      "distanceToPlaceMeters": 164,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "andong-market": {
      "lat": 36.5648072,
      "lng": 128.7270397,
      "osm": "https://www.openstreetmap.org/way/552314285",
      "distanceToPlaceMeters": 146,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "gongju-market": {
      "lat": 36.4573594,
      "lng": 127.1208337,
      "osm": "https://www.openstreetmap.org/way/919624574",
      "distanceToPlaceMeters": 230,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "yesan-market": {
      "lat": 36.6764465,
      "lng": 126.8499732,
      "osm": "https://www.openstreetmap.org/way/1144336891",
      "distanceToPlaceMeters": 69,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "hongseong-market": {
      "lat": 36.6003788,
      "lng": 126.6664064,
      "osm": "https://www.openstreetmap.org/way/1099643236",
      "distanceToPlaceMeters": 249,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "gwangcheon-market": {
      "lat": 36.5012098,
      "lng": 126.6241274,
      "osm": "https://www.openstreetmap.org/way/503301170",
      "distanceToPlaceMeters": 96,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "daecheon-market": {
      "lat": 36.327054,
      "lng": 126.5104359,
      "osm": "https://www.openstreetmap.org/way/1383494555",
      "distanceToPlaceMeters": 153,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "nongol": {
      "lat": 37.5514873,
      "lng": 129.1126039,
      "osm": "https://www.openstreetmap.org/way/940379305",
      "distanceToPlaceMeters": 512,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "jukseoru": {
      "lat": 37.4410315,
      "lng": 129.1616299,
      "osm": "https://www.openstreetmap.org/way/469859203",
      "distanceToPlaceMeters": 35,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "heonhwa": {
      "lat": 37.6653231,
      "lng": 129.0530888,
      "osm": "https://www.openstreetmap.org/way/1525757578",
      "distanceToPlaceMeters": 257,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "jangho": {
      "lat": 37.28434,
      "lng": 129.3109352,
      "osm": "https://www.openstreetmap.org/way/1134678232",
      "distanceToPlaceMeters": 342,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "seongryu": {
      "lat": 36.9590596,
      "lng": 129.3791648,
      "osm": "https://www.openstreetmap.org/way/38484008",
      "distanceToPlaceMeters": 270,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "buseok-seosan": {
      "lat": 36.7049453,
      "lng": 126.4089719,
      "osm": "https://www.openstreetmap.org/way/1361053108",
      "distanceToPlaceMeters": 348,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "sindolseok": {
      "lat": 36.5219762,
      "lng": 129.4051147,
      "osm": "https://www.openstreetmap.org/way/1267033352",
      "distanceToPlaceMeters": 303,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "dansan": {
      "lat": 36.9514893,
      "lng": 128.6158914,
      "osm": "https://www.openstreetmap.org/way/1432689650",
      "distanceToPlaceMeters": 430,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "geojosa": {
      "lat": 36.020427,
      "lng": 128.7649345,
      "osm": "https://www.openstreetmap.org/way/1446421001",
      "distanceToPlaceMeters": 44,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "hupo": {
      "lat": 36.6790601,
      "lng": 129.4616801,
      "osm": "https://www.openstreetmap.org/way/1255389673",
      "distanceToPlaceMeters": 162,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "baeron": {
      "lat": 37.1592611,
      "lng": 128.0852029,
      "osm": "https://www.openstreetmap.org/way/1381868084",
      "distanceToPlaceMeters": 251,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "sainam": {
      "lat": 36.8911327,
      "lng": 128.3423633,
      "osm": "https://www.openstreetmap.org/way/948412470",
      "distanceToPlaceMeters": 457,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "uirim-museum": {
      "lat": 37.1765611,
      "lng": 128.2071862,
      "osm": "https://www.openstreetmap.org/way/1255162429",
      "distanceToPlaceMeters": 209,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "uirim-forest": {
      "lat": 37.1842503,
      "lng": 128.2056057,
      "osm": "https://www.openstreetmap.org/way/1255162424",
      "distanceToPlaceMeters": 105,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "sangseonam": {
      "lat": 36.8729172,
      "lng": 128.2926788,
      "osm": "https://www.openstreetmap.org/node/8837322352",
      "distanceToPlaceMeters": 189,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "jiyong": {
      "lat": 36.3176389,
      "lng": 127.5831303,
      "osm": "https://www.openstreetmap.org/way/1485171936",
      "distanceToPlaceMeters": 298,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "ojanghwan": {
      "lat": 36.4932873,
      "lng": 127.5967481,
      "osm": "https://www.openstreetmap.org/way/1173944743",
      "distanceToPlaceMeters": 55,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "gongsanseong": {
      "lat": 36.4619344,
      "lng": 127.1241646,
      "osm": "https://www.openstreetmap.org/way/1030745690",
      "distanceToPlaceMeters": 264,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "oeam": {
      "lat": 36.7306419,
      "lng": 127.0126998,
      "osm": "https://www.openstreetmap.org/way/474358968",
      "distanceToPlaceMeters": 162,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "ganwolam": {
      "lat": 36.6059208,
      "lng": 126.4139933,
      "osm": "https://www.openstreetmap.org/way/427210824",
      "distanceToPlaceMeters": 326,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "sudeoksa": {
      "lat": 36.6568689,
      "lng": 126.6217387,
      "osm": "https://www.openstreetmap.org/way/1268342753",
      "distanceToPlaceMeters": 691,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "gungnamji": {
      "lat": 36.2712318,
      "lng": 126.9093962,
      "osm": "https://www.openstreetmap.org/way/1426762869",
      "distanceToPlaceMeters": 341,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "muchangpo": {
      "lat": 36.2458719,
      "lng": 126.5386326,
      "osm": "https://www.openstreetmap.org/way/1031334285",
      "distanceToPlaceMeters": 326,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "haemi": {
      "lat": 36.7114579,
      "lng": 126.5505859,
      "osm": "https://www.openstreetmap.org/way/1079782639",
      "distanceToPlaceMeters": 222,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "sosu": {
      "lat": 36.9241394,
      "lng": 128.5785811,
      "osm": "https://www.openstreetmap.org/way/158302836",
      "distanceToPlaceMeters": 158,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "buseok-yeongju": {
      "lat": 36.9973341,
      "lng": 128.6878478,
      "osm": "https://www.openstreetmap.org/way/1185628662",
      "distanceToPlaceMeters": 186,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "oryukdo-skywalk": {
      "lat": 35.1019335,
      "lng": 129.1230405,
      "osm": "https://www.openstreetmap.org/way/457655967",
      "distanceToPlaceMeters": 216,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "gamcheon": {
      "lat": 35.0966453,
      "lng": 129.009308,
      "osm": "https://www.openstreetmap.org/way/1468485986",
      "distanceToPlaceMeters": 58,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "eulsukdo": {
      "lat": 35.1062365,
      "lng": 128.9448987,
      "osm": "https://www.openstreetmap.org/way/375145531",
      "distanceToPlaceMeters": 599,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "suro-tomb": {
      "lat": 35.2317921,
      "lng": 128.8714636,
      "osm": "https://www.openstreetmap.org/way/471313691",
      "distanceToPlaceMeters": 130,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "bongha": {
      "lat": 35.3139838,
      "lng": 128.76973,
      "osm": "https://www.openstreetmap.org/way/681392479",
      "distanceToPlaceMeters": 64,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "tongdosa": {
      "lat": 35.4875115,
      "lng": 129.0670437,
      "osm": "https://www.openstreetmap.org/way/472094215",
      "distanceToPlaceMeters": 252,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "yeongnamru": {
      "lat": 35.4923628,
      "lng": 128.7543048,
      "osm": "https://www.openstreetmap.org/way/468990190",
      "distanceToPlaceMeters": 104,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "pyochungsa": {
      "lat": 35.5321772,
      "lng": 128.9562747,
      "osm": "https://www.openstreetmap.org/way/1191746221",
      "distanceToPlaceMeters": 296,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "jinjuseong": {
      "lat": 35.1907423,
      "lng": 128.0785257,
      "osm": "https://www.openstreetmap.org/way/1264880950",
      "distanceToPlaceMeters": 230,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "samcheonpo-bridge": {
      "lat": 34.93181,
      "lng": 128.0521684,
      "osm": "https://www.openstreetmap.org/way/1279900742",
      "distanceToPlaceMeters": 398,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "choechampan-house": {
      "lat": 35.1560435,
      "lng": 127.6867177,
      "osm": "https://www.openstreetmap.org/way/1445340655",
      "distanceToPlaceMeters": 136,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "hwagae-market": {
      "lat": 35.1885893,
      "lng": 127.6250698,
      "osm": "https://www.openstreetmap.org/way/1433220204",
      "distanceToPlaceMeters": 75,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "donguibogam-village": {
      "lat": 35.4390561,
      "lng": 127.829505,
      "osm": "https://www.openstreetmap.org/way/1217000575",
      "distanceToPlaceMeters": 134,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "sangnim-forest": {
      "lat": 35.5292474,
      "lng": 127.7190045,
      "osm": "https://www.openstreetmap.org/way/1362804187",
      "distanceToPlaceMeters": 217,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "suseungdae": {
      "lat": 35.760328,
      "lng": 127.8343134,
      "osm": "https://www.openstreetmap.org/way/1414809203",
      "distanceToPlaceMeters": 62,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "dongpirang": {
      "lat": 34.8432427,
      "lng": 128.428562,
      "osm": "https://www.openstreetmap.org/way/1424942502",
      "distanceToPlaceMeters": 280,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "sangjogam": {
      "lat": 34.9072402,
      "lng": 128.1518646,
      "osm": "https://www.openstreetmap.org/way/1286708176",
      "distanceToPlaceMeters": 307,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "hwaeomsa": {
      "lat": 35.2563656,
      "lng": 127.4984756,
      "osm": "https://www.openstreetmap.org/way/404191591",
      "distanceToPlaceMeters": 143,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "maehwa-village": {
      "lat": 35.0790826,
      "lng": 127.718201,
      "osm": "https://www.openstreetmap.org/way/432769817",
      "distanceToPlaceMeters": 117,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "gubongsan-observatory": {
      "lat": 34.9360061,
      "lng": 127.6388575,
      "osm": "https://www.openstreetmap.org/way/1116172317",
      "distanceToPlaceMeters": 401,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "naganeupseong": {
      "lat": 34.9039018,
      "lng": 127.3429886,
      "osm": "https://www.openstreetmap.org/way/111875484",
      "distanceToPlaceMeters": 223,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "suncheon-bay": {
      "lat": 34.8862655,
      "lng": 127.5082153,
      "osm": "https://www.openstreetmap.org/way/481373132",
      "distanceToPlaceMeters": 63,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "daehan-dawon": {
      "lat": 34.7144092,
      "lng": 127.0808816,
      "osm": "https://www.openstreetmap.org/way/666108123",
      "distanceToPlaceMeters": 311,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "juknokwon": {
      "lat": 35.3182067,
      "lng": 126.9742293,
      "osm": "https://www.openstreetmap.org/way/1267320179",
      "distanceToPlaceMeters": 120,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "unjusa": {
      "lat": 34.9201982,
      "lng": 126.8770735,
      "osm": "https://www.openstreetmap.org/way/1290848428",
      "distanceToPlaceMeters": 654,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "geumseonggwan": {
      "lat": 35.0328615,
      "lng": 126.7160282,
      "osm": "https://www.openstreetmap.org/way/478611741",
      "distanceToPlaceMeters": 71,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "dasan-chodang": {
      "lat": 34.5855227,
      "lng": 126.74959,
      "osm": "https://www.openstreetmap.org/way/797750780",
      "distanceToPlaceMeters": 672,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "seonamsa": {
      "lat": 34.9963364,
      "lng": 127.3320807,
      "osm": "https://www.openstreetmap.org/way/1288203246",
      "distanceToPlaceMeters": 121,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "soswaewon": {
      "lat": 35.1824091,
      "lng": 127.0111096,
      "osm": "https://www.openstreetmap.org/way/623049806",
      "distanceToPlaceMeters": 167,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "gwanghallu": {
      "lat": 35.4018037,
      "lng": 127.3784894,
      "osm": "https://www.openstreetmap.org/way/706382449",
      "distanceToPlaceMeters": 146,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "honbul-museum": {
      "lat": 35.4813541,
      "lng": 127.320595,
      "osm": "https://www.openstreetmap.org/way/1317549009",
      "distanceToPlaceMeters": 84,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "jeonju-hanok": {
      "lat": 35.8188458,
      "lng": 127.1538137,
      "osm": "https://www.openstreetmap.org/way/408468176",
      "distanceToPlaceMeters": 101,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "gyeonggijeon": {
      "lat": 35.8141298,
      "lng": 127.1493168,
      "osm": "https://www.openstreetmap.org/way/116794257",
      "distanceToPlaceMeters": 175,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "seonunsa": {
      "lat": 35.4960863,
      "lng": 126.5793344,
      "osm": "https://www.openstreetmap.org/way/375627348",
      "distanceToPlaceMeters": 120,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "gochang-fortress": {
      "lat": 35.4323599,
      "lng": 126.7053891,
      "osm": "https://www.openstreetmap.org/way/1553971404",
      "distanceToPlaceMeters": 315,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "chaeseokgang": {
      "lat": 35.6267444,
      "lng": 126.4696328,
      "osm": "https://www.openstreetmap.org/way/1263592542",
      "distanceToPlaceMeters": 135,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "gunsan-history": {
      "lat": 35.990601,
      "lng": 126.7115259,
      "osm": "https://www.openstreetmap.org/way/264394785",
      "distanceToPlaceMeters": 65,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "byeokgolje": {
      "lat": 35.7540724,
      "lng": 126.8528606,
      "osm": "https://www.openstreetmap.org/way/160295347",
      "distanceToPlaceMeters": 72,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "naesosa": {
      "lat": 35.616945,
      "lng": 126.5886421,
      "osm": "https://www.openstreetmap.org/node/11072182261",
      "distanceToPlaceMeters": 141,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "mireuksa": {
      "lat": 36.0121493,
      "lng": 127.0340274,
      "osm": "https://www.openstreetmap.org/way/1180354557",
      "distanceToPlaceMeters": 312,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "jinju-market": {
      "lat": 35.1949158,
      "lng": 128.0874981,
      "osm": "https://www.openstreetmap.org/way/1158905546",
      "distanceToPlaceMeters": 209,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    },
    "damyang-market": {
      "lat": 35.3219297,
      "lng": 126.9815895,
      "osm": "https://www.openstreetmap.org/way/1213587885",
      "distanceToPlaceMeters": 121,
      "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
    }
  },
  "replacements": [
    {
      "id": "chueam-beach",
      "kind": "spot",
      "name": "추암해수욕장",
      "region": "강원 · 동해",
      "category": "nature",
      "lead": "해안 바위와 모래사장을 짧게 둘러봅니다.",
      "description": "해안 바위와 모래사장을 짧게 둘러봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "강원 동해 추암해수욕장",
      "source": "https://www.openstreetmap.org/node/368950776",
      "parking": {
        "lat": 37.4784475,
        "lng": 129.1580649,
        "osm": "https://www.openstreetmap.org/way/469543121",
        "distanceToPlaceMeters": 139,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/%EC%B6%94%EC%95%94%ED%95%B4%EC%88%98%EC%9A%95%EC%9E%A5.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%B6%94%EC%95%94%ED%95%B4%EC%88%98%EC%9A%95%EC%9E%A5.jpg",
      "photoCredit": "Wikimedia Commons · 산야바다 · CC BY-SA 2.0 kr",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "poseokjeong",
      "kind": "spot",
      "name": "포석정",
      "region": "경북 · 경주",
      "category": "culture",
      "lead": "신라 유적의 석조 수로를 가까이서 봅니다.",
      "description": "신라 유적의 석조 수로를 가까이서 봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "경북 경주 포석정",
      "source": "https://www.openstreetmap.org/way/690597485",
      "parking": {
        "lat": 35.8070362,
        "lng": 129.2113782,
        "osm": "https://www.openstreetmap.org/node/6477829878",
        "distanceToPlaceMeters": 103,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Korea-Gyeongju-Poseokjeong%20site%203832-06.JPG?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Gyeongju-Poseokjeong_site_3832-06.JPG",
      "photoCredit": "Wikimedia Commons · Steve46814 · CC BY-SA 3.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "unilam-banilam",
      "kind": "spot",
      "name": "운일암반일암",
      "region": "전북 · 진안",
      "category": "nature",
      "lead": "계곡 풍경 앞에서 잠시 쉬어갑니다.",
      "description": "계곡 풍경 앞에서 잠시 쉬어갑니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "전북 진안 운일암반일암",
      "source": "https://www.openstreetmap.org/node/1241518279",
      "parking": {
        "lat": 35.9789515,
        "lng": 127.4017072,
        "osm": "https://www.openstreetmap.org/node/1241518233",
        "distanceToPlaceMeters": 32,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/JJ-UB-Natl-Geopark.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:JJ-UB-Natl-Geopark.jpg",
      "photoCredit": "Wikimedia Commons · Dittwjfsdgkvkdjg · CC BY-SA 3.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "yangdong-village",
      "kind": "spot",
      "name": "양동마을",
      "region": "경북 · 경주",
      "category": "culture",
      "lead": "마을 입구에서 오래된 한옥 풍경을 만납니다.",
      "description": "마을 입구에서 오래된 한옥 풍경을 만납니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "경북 경주 양동마을",
      "source": "https://www.openstreetmap.org/node/5388533525",
      "parking": {
        "lat": 35.9954384,
        "lng": 129.2532664,
        "osm": "https://www.openstreetmap.org/way/374018337",
        "distanceToPlaceMeters": 81,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Yangdong%20Village%2004.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Yangdong_Village_04.jpg",
      "photoCredit": "Wikimedia Commons · Bernard Gagnon · CC0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "gyeongju-gyochon",
      "kind": "spot",
      "name": "경주교촌마을",
      "region": "경북 · 경주",
      "category": "culture",
      "lead": "교촌의 한옥 골목을 짧게 걷습니다.",
      "description": "교촌의 한옥 골목을 짧게 걷습니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "경북 경주 경주교촌마을",
      "source": "https://www.openstreetmap.org/node/5570689923",
      "parking": {
        "lat": 35.8298371,
        "lng": 129.2139043,
        "osm": "https://www.openstreetmap.org/way/1483493713",
        "distanceToPlaceMeters": 94,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Gyochon%20Traditional%20Village%2007.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Gyochon_Traditional_Village_07.jpg",
      "photoCredit": "Wikimedia Commons · Seefooddiet · CC BY-SA 4.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "sabuk-coal-village",
      "kind": "spot",
      "name": "사북탄광문화관광촌",
      "region": "강원 · 정선",
      "category": "culture",
      "lead": "사북의 탄광 역사를 만나봅니다.",
      "description": "사북의 탄광 역사를 만나봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "강원 정선 사북탄광문화관광촌",
      "source": "https://www.openstreetmap.org/node/5208438424",
      "parking": {
        "lat": 37.2206361,
        "lng": 128.8154423,
        "osm": "https://www.openstreetmap.org/way/692391488",
        "distanceToPlaceMeters": 72,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "",
      "photoSource": "",
      "photoCredit": "",
      "photoKind": ""
    },
    {
      "id": "kim-satgat-museum",
      "kind": "spot",
      "name": "김삿갓문학관",
      "region": "강원 · 영월",
      "category": "culture",
      "lead": "영월의 문학과 산골 이야기를 둘러봅니다.",
      "description": "영월의 문학과 산골 이야기를 둘러봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "강원 영월 김삿갓문학관",
      "source": "https://www.openstreetmap.org/node/5257334524",
      "parking": {
        "lat": 37.0806772,
        "lng": 128.6017427,
        "osm": "https://www.openstreetmap.org/way/1256430428",
        "distanceToPlaceMeters": 134,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "",
      "photoSource": "",
      "photoCredit": "",
      "photoKind": ""
    },
    {
      "id": "jangsaengpo-whale",
      "kind": "spot",
      "name": "장생포고래박물관",
      "region": "울산 · 남구",
      "category": "culture",
      "lead": "장생포의 고래 문화를 짧게 둘러봅니다.",
      "description": "장생포의 고래 문화를 짧게 둘러봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "울산 남구 장생포고래박물관",
      "source": "https://www.openstreetmap.org/node/368735556",
      "parking": {
        "lat": 35.5027577,
        "lng": 129.3817014,
        "osm": "https://www.openstreetmap.org/way/1355966618",
        "distanceToPlaceMeters": 66,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Jangsaengpo%20Whale%20Museum%2002.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Jangsaengpo_Whale_Museum_02.jpg",
      "photoCredit": "Wikimedia Commons · Korea Tourism Organization, Lee Bumsu · KOGL Type 1",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "gochang-dolmen-museum",
      "kind": "spot",
      "name": "고창고인돌박물관",
      "region": "전북 · 고창",
      "category": "culture",
      "lead": "고인돌의 역사와 고창의 들판을 만납니다.",
      "description": "고인돌의 역사와 고창의 들판을 만납니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "전북 고창 고창고인돌박물관",
      "source": "https://www.openstreetmap.org/node/368734249",
      "parking": {
        "lat": 35.4412719,
        "lng": 126.652544,
        "osm": "https://www.openstreetmap.org/way/1524923507",
        "distanceToPlaceMeters": 57,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Gochang%20Dolmens%20Skyline%2C%20South%20Korea.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Gochang_Dolmens_Skyline,_South_Korea.jpg",
      "photoCredit": "Wikimedia Commons · Vanlewen · CC BY-SA 4.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "national-lighthouse-museum",
      "kind": "spot",
      "name": "국립등대박물관",
      "region": "경북 · 포항",
      "category": "culture",
      "lead": "호미곶의 등대와 바다 이야기를 봅니다.",
      "description": "호미곶의 등대와 바다 이야기를 봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "경북 포항 국립등대박물관",
      "source": "https://www.openstreetmap.org/node/368735535",
      "parking": {
        "lat": 36.0772475,
        "lng": 129.568436,
        "osm": "https://www.openstreetmap.org/way/1351119664",
        "distanceToPlaceMeters": 63,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Lighthouse%20museum%20entrance.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Lighthouse_museum_entrance.jpg",
      "photoCredit": "Wikimedia Commons · User:Altostratus · CC BY-SA 4.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "byeongbangchi-skywalk",
      "kind": "spot",
      "name": "병방치스카이워크",
      "region": "강원 · 정선",
      "category": "nature",
      "lead": "동강이 감아 도는 지형을 내려다봅니다.",
      "description": "동강이 감아 도는 지형을 내려다봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "강원 정선 병방치스카이워크",
      "source": "https://www.openstreetmap.org/way/1194648265",
      "parking": {
        "lat": 37.3627073,
        "lng": 128.6358147,
        "osm": "https://www.openstreetmap.org/way/1194648269",
        "distanceToPlaceMeters": 65,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "",
      "photoSource": "",
      "photoCredit": "",
      "photoKind": ""
    },
    {
      "id": "domaryeong-viewpoint",
      "kind": "spot",
      "name": "도마령전망대",
      "region": "충북 · 영동",
      "category": "nature",
      "lead": "고갯마루에서 산 능선을 바라봅니다.",
      "description": "고갯마루에서 산 능선을 바라봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "충북 영동 도마령전망대",
      "source": "https://www.openstreetmap.org/way/1547081533",
      "parking": {
        "lat": 36.0690473,
        "lng": 127.8344209,
        "osm": "https://www.openstreetmap.org/way/1228545657",
        "distanceToPlaceMeters": 63,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "",
      "photoSource": "",
      "photoCredit": "",
      "photoKind": ""
    },
    {
      "id": "abai-village",
      "kind": "spot",
      "name": "속초 아바이마을",
      "region": "강원 · 속초",
      "category": "culture",
      "lead": "항구와 골목이 만나는 마을을 걷습니다.",
      "description": "항구와 골목이 만나는 마을을 걷습니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "강원 속초 속초 아바이마을",
      "source": "https://www.openstreetmap.org/node/5466151121",
      "parking": {
        "lat": 38.2024822,
        "lng": 128.5944861,
        "osm": "https://www.openstreetmap.org/way/1253602348",
        "distanceToPlaceMeters": 107,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Abai%20Village.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Abai_Village.jpg",
      "photoCredit": "Wikimedia Commons · Marie · CC BY-SA 2.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "cheongju-national-museum",
      "kind": "spot",
      "name": "국립청주박물관",
      "region": "충북 · 청주",
      "category": "culture",
      "lead": "충북의 문화재를 살펴봅니다.",
      "description": "충북의 문화재를 살펴봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "충북 청주 국립청주박물관",
      "source": "https://www.openstreetmap.org/node/368734079",
      "parking": {
        "lat": 36.649857,
        "lng": 127.5132734,
        "osm": "https://www.openstreetmap.org/way/923279522",
        "distanceToPlaceMeters": 125,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Cheongju%20National%20Museum.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Cheongju_National_Museum.jpg",
      "photoCredit": "Wikimedia Commons · Kim Jiho, Korea Tourism Organization · KOGL Type 1",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "gameunsa-site",
      "kind": "spot",
      "name": "경주 감은사지",
      "region": "경북 · 경주",
      "category": "culture",
      "lead": "두 석탑이 선 신라 사찰 터를 봅니다.",
      "description": "두 석탑이 선 신라 사찰 터를 봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "경북 경주 경주 감은사지",
      "source": "https://www.openstreetmap.org/way/137066472",
      "parking": {
        "lat": 35.7468833,
        "lng": 129.4768288,
        "osm": "https://www.openstreetmap.org/way/1509828610",
        "distanceToPlaceMeters": 138,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Korea-Gyeongju-Gameunsa%20temple%20site%20remains-02.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Gyeongju-Gameunsa_temple_site_remains-02.jpg",
      "photoCredit": "Wikimedia Commons · Junho Jung · CC BY 3.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "donggung-wolji",
      "kind": "spot",
      "name": "경주 동궁과 월지",
      "region": "경북 · 경주",
      "category": "culture",
      "lead": "연못과 신라 궁궐 터를 산책합니다.",
      "description": "연못과 신라 궁궐 터를 산책합니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "경북 경주 경주 동궁과 월지",
      "source": "https://www.openstreetmap.org/way/477417220",
      "parking": {
        "lat": 35.8330445,
        "lng": 129.2277983,
        "osm": "https://www.openstreetmap.org/way/372158914",
        "distanceToPlaceMeters": 200,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Water%20reflection%20of%20Donggung%20Palace%20in%20Wolji%20Pond%20at%20blue%20hour%20in%20Gyeongju%20South%20Korea.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Water_reflection_of_Donggung_Palace_in_Wolji_Pond_at_blue_hour_in_Gyeongju_South_Korea.jpg",
      "photoCredit": "Wikimedia Commons · Basile Morin · CC BY-SA 4.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "bunhwangsa",
      "kind": "spot",
      "name": "분황사",
      "region": "경북 · 경주",
      "category": "culture",
      "lead": "모전석탑 앞에서 신라의 시간을 만납니다.",
      "description": "모전석탑 앞에서 신라의 시간을 만납니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "경북 경주 분황사",
      "source": "https://www.openstreetmap.org/way/479216009",
      "parking": {
        "lat": 35.8406695,
        "lng": 129.2330508,
        "osm": "https://www.openstreetmap.org/way/665157692",
        "distanceToPlaceMeters": 50,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Korea-Gyeongju-Bunhwangsa-Three%20story%20pagoda-02.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Gyeongju-Bunhwangsa-Three_story_pagoda-02.jpg",
      "photoCredit": "Wikimedia Commons · Junho Jung · CC BY-SA 3.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "gangneung-seongyojang",
      "kind": "spot",
      "name": "강릉선교장",
      "region": "강원 · 강릉",
      "category": "culture",
      "lead": "강릉의 오래된 한옥을 둘러봅니다.",
      "description": "강릉의 오래된 한옥을 둘러봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "강원 강릉 강릉선교장",
      "source": "https://www.openstreetmap.org/way/510156500",
      "parking": {
        "lat": 37.7855551,
        "lng": 128.8852286,
        "osm": "https://www.openstreetmap.org/way/1462637666",
        "distanceToPlaceMeters": 105,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Seongyojang%2020220501%20060.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File%3ASeongyojang_20220501_060.jpg",
      "photoCredit": "Wikimedia Commons · Mobius6 · CC BY-SA 4.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "piram-seowon",
      "kind": "spot",
      "name": "필암서원",
      "region": "전남 · 장성",
      "category": "culture",
      "lead": "호남의 서원과 마당을 살펴봅니다.",
      "description": "호남의 서원과 마당을 살펴봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "전남 장성 필암서원",
      "source": "https://www.openstreetmap.org/way/876132625",
      "parking": {
        "lat": 35.3094418,
        "lng": 126.7528796,
        "osm": "https://www.openstreetmap.org/way/702436356",
        "distanceToPlaceMeters": 160,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Piramseowon%20Confucian%20Academy%2C%20Hwakyeonru.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Piramseowon_Confucian_Academy,_Hwakyeonru.jpg",
      "photoCredit": "Wikimedia Commons · Trainholic · CC BY 4.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "busan-maritime-museum",
      "kind": "spot",
      "name": "국립해양박물관",
      "region": "부산 · 영도",
      "category": "culture",
      "lead": "바다와 항해의 역사를 둘러봅니다.",
      "description": "바다와 항해의 역사를 둘러봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "부산 영도 국립해양박물관",
      "source": "https://www.openstreetmap.org/way/243644910",
      "parking": {
        "lat": 35.0794864,
        "lng": 129.0792674,
        "osm": "https://www.openstreetmap.org/way/1227024541",
        "distanceToPlaceMeters": 127,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/EH1211481%20National%20Maritime%20Museum%2010%20%28cropped%29.JPG?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:EH1211481_National_Maritime_Museum_10_(cropped).JPG",
      "photoCredit": "Wikimedia Commons · Katie Chan · CC BY-SA 3.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "un-memorial-cemetery",
      "kind": "spot",
      "name": "재한국 국제연합 기념공원",
      "region": "부산 · 남구",
      "category": "culture",
      "lead": "참전 용사를 기리는 추모 공간을 방문합니다.",
      "description": "참전 용사를 기리는 추모 공간을 방문합니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "부산 남구 재한국 국제연합 기념공원",
      "source": "https://www.openstreetmap.org/way/476626810",
      "parking": {
        "lat": 35.1271321,
        "lng": 129.0956324,
        "osm": "https://www.openstreetmap.org/way/477293069",
        "distanceToPlaceMeters": 122,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/UN%20Memorial%20Cemetery.JPG?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File%3AUN_Memorial_Cemetery.JPG",
      "photoCredit": "Wikimedia Commons · Leon Petrosyan · CC BY-SA 3.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "unjoru",
      "kind": "spot",
      "name": "운조루",
      "region": "전남 · 구례",
      "category": "culture",
      "lead": "구례의 고택과 마을 풍경을 만납니다.",
      "description": "구례의 고택과 마을 풍경을 만납니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "전남 구례 운조루",
      "source": "https://www.openstreetmap.org/node/1002897673",
      "parking": {
        "lat": 35.2049952,
        "lng": 127.5143422,
        "osm": "https://www.openstreetmap.org/way/1167650844",
        "distanceToPlaceMeters": 147,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/%EC%99%B8%EB%B6%80%EC%97%90%EC%84%9C%20%EB%B0%94%EB%9D%BC%EB%B3%B8%20%EB%8C%80%EB%AC%B8%EC%B1%84.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%99%B8%EB%B6%80%EC%97%90%EC%84%9C_%EB%B0%94%EB%9D%BC%EB%B3%B8_%EB%8C%80%EB%AC%B8%EC%B1%84.jpg",
      "photoCredit": "Wikimedia Commons · 문화재청 · KOGL Type 1",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "dadaepo-beach",
      "kind": "spot",
      "name": "다대포해수욕장",
      "region": "부산 · 사하",
      "category": "nature",
      "lead": "넓은 백사장과 낙동강 하구를 바라봅니다.",
      "description": "넓은 백사장과 낙동강 하구를 바라봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "부산 사하 다대포해수욕장",
      "source": "https://www.openstreetmap.org/node/414662959",
      "parking": {
        "lat": 35.0478902,
        "lng": 128.9642761,
        "osm": "https://www.openstreetmap.org/way/481904103",
        "distanceToPlaceMeters": 119,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Dadaepo%20Beach%2C%20Busan%2C%20Korea.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Dadaepo_Beach,_Busan,_Korea.jpg",
      "photoCredit": "Wikimedia Commons · Ken Eckert · CC BY-SA 4.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "boryeong-suyeongseong",
      "kind": "spot",
      "name": "보령충청수영성",
      "region": "충남 · 보령",
      "category": "culture",
      "lead": "서해를 바라보는 수군 성곽을 걷습니다.",
      "description": "서해를 바라보는 수군 성곽을 걷습니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "충남 보령 보령충청수영성",
      "source": "https://www.openstreetmap.org/node/13411773142",
      "parking": {
        "lat": 36.4399978,
        "lng": 126.5219372,
        "osm": "https://www.openstreetmap.org/way/1528558279",
        "distanceToPlaceMeters": 105,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Navy%20Headquarters%20of%20Chungcheong-do%20Province%2C%20Boryeong%20in%202026%20%285%29.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Navy_Headquarters_of_Chungcheong-do_Province,_Boryeong_in_2026_(5).jpg",
      "photoCredit": "Wikimedia Commons · Sadopaul · CC BY-SA 4.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "hapcheon-film-park",
      "kind": "spot",
      "name": "합천영상테마파크",
      "region": "경남 · 합천",
      "category": "culture",
      "lead": "옛 거리 세트의 한 구간을 둘러봅니다.",
      "description": "옛 거리 세트의 한 구간을 둘러봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "경남 합천 합천영상테마파크",
      "source": "https://www.openstreetmap.org/way/469664946",
      "parking": {
        "lat": 35.5481872,
        "lng": 128.0718142,
        "osm": "https://www.openstreetmap.org/way/1030859313",
        "distanceToPlaceMeters": 136,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "",
      "photoSource": "",
      "photoCredit": "",
      "photoKind": ""
    },
    {
      "id": "clayarch-gimhae",
      "kind": "spot",
      "name": "클레이아크김해미술관",
      "region": "경남 · 김해",
      "category": "culture",
      "lead": "도자와 건축을 만나는 전시 공간입니다.",
      "description": "도자와 건축을 만나는 전시 공간입니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "경남 김해 클레이아크김해미술관",
      "source": "https://www.openstreetmap.org/way/570612323",
      "parking": {
        "lat": 35.250879,
        "lng": 128.7442551,
        "osm": "https://www.openstreetmap.org/way/474821330",
        "distanceToPlaceMeters": 72,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Clayarch%20Gimhae%20Museum.JPG?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Clayarch_Gimhae_Museum.JPG",
      "photoCredit": "Wikimedia Commons · HappyMidnight · CC BY-SA 4.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "hongseong-sky-tower",
      "kind": "spot",
      "name": "홍성스카이타워",
      "region": "충남 · 홍성",
      "category": "nature",
      "lead": "서해안의 바다와 들을 내려다봅니다.",
      "description": "서해안의 바다와 들을 내려다봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "충남 홍성 홍성스카이타워",
      "source": "https://www.openstreetmap.org/way/1473474821",
      "parking": {
        "lat": 36.5767088,
        "lng": 126.4646245,
        "osm": "https://www.openstreetmap.org/way/1473474822",
        "distanceToPlaceMeters": 26,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "",
      "photoSource": "",
      "photoCredit": "",
      "photoKind": ""
    },
    {
      "id": "chuncheon-national-museum",
      "kind": "spot",
      "name": "국립춘천박물관",
      "region": "강원 · 춘천",
      "category": "culture",
      "lead": "강원의 유물과 문화를 둘러봅니다.",
      "description": "강원의 유물과 문화를 둘러봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "강원 춘천 국립춘천박물관",
      "source": "https://www.openstreetmap.org/way/475122832",
      "parking": {
        "lat": 37.8637727,
        "lng": 127.7555598,
        "osm": "https://www.openstreetmap.org/way/1202055206",
        "distanceToPlaceMeters": 146,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Chuncheon%20National%20Museum.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Chuncheon_National_Museum.jpg",
      "photoCredit": "Wikimedia Commons · Trainholic · CC BY-SA 3.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "bangdong-spring",
      "kind": "spot",
      "name": "방동약수",
      "region": "강원 · 인제",
      "category": "nature",
      "lead": "산간 도로 곁 약수터에서 쉽니다.",
      "description": "산간 도로 곁 약수터에서 쉽니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "강원 인제 방동약수",
      "source": "https://www.openstreetmap.org/node/1881933249",
      "parking": {
        "lat": 37.9443506,
        "lng": 128.3956985,
        "osm": "https://www.openstreetmap.org/node/1881935361",
        "distanceToPlaceMeters": 82,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "",
      "photoSource": "",
      "photoCredit": "",
      "photoKind": ""
    },
    {
      "id": "dolsan-park",
      "kind": "spot",
      "name": "돌산공원",
      "region": "전남 · 여수",
      "category": "nature",
      "lead": "여수항과 돌산대교를 조망합니다.",
      "description": "여수항과 돌산대교를 조망합니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "전남 여수 돌산공원",
      "source": "https://www.openstreetmap.org/way/93218968",
      "parking": {
        "lat": 34.7312952,
        "lng": 127.740154,
        "osm": "https://www.openstreetmap.org/way/867612517",
        "distanceToPlaceMeters": 94,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Dolsan%20Bridge%20Monument%2020180929%20002.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Dolsan_Bridge_Monument_20180929_002.jpg",
      "photoCredit": "Wikimedia Commons · Mobius6 · CC BY-SA 4.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "beomeosa",
      "kind": "spot",
      "name": "범어사",
      "region": "부산 · 금정",
      "category": "culture",
      "lead": "금정산 자락의 사찰을 둘러봅니다.",
      "description": "금정산 자락의 사찰을 둘러봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "부산 금정 범어사",
      "source": "https://www.openstreetmap.org/way/131922091",
      "parking": {
        "lat": 35.2846267,
        "lng": 129.069381,
        "osm": "https://www.openstreetmap.org/way/1280410216",
        "distanceToPlaceMeters": 98,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Interior%20view%20of%20Beomeosa%20temple%20with%20two%20Buddhist%20monks%20in%20Busan%20South%20Korea.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Interior_view_of_Beomeosa_temple_with_two_Buddhist_monks_in_Busan_South_Korea.jpg",
      "photoCredit": "Wikimedia Commons · Basile Morin · CC BY-SA 4.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "mokpo-marine-relics",
      "kind": "spot",
      "name": "국립해양유물전시관",
      "region": "전남 · 목포",
      "category": "culture",
      "lead": "바다에서 발견된 유물을 살펴봅니다.",
      "description": "바다에서 발견된 유물을 살펴봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "전남 목포 국립해양유물전시관",
      "source": "https://www.openstreetmap.org/node/368898167",
      "parking": {
        "lat": 34.7926303,
        "lng": 126.4221545,
        "osm": "https://www.openstreetmap.org/way/551187059",
        "distanceToPlaceMeters": 99,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Korean%20marine%20relic%20pavilion%2C%20Mokpo.JPG?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korean_marine_relic_pavilion,_Mokpo.JPG",
      "photoCredit": "Wikimedia Commons · Kussy · CC BY-SA 2.1 jp",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "gacheon-terraces",
      "kind": "spot",
      "name": "가천 다랑이논",
      "region": "경남 · 남해",
      "category": "nature",
      "lead": "바다로 내려가는 계단식 논을 바라봅니다.",
      "description": "바다로 내려가는 계단식 논을 바라봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "경남 남해 가천 다랑이논",
      "source": "https://www.openstreetmap.org/way/1200046470",
      "parking": {
        "lat": 34.7296044,
        "lng": 127.895929,
        "osm": "https://www.openstreetmap.org/way/1197852942",
        "distanceToPlaceMeters": 155,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/%EB%82%A8%ED%95%B4%20%EA%B0%80%EC%B2%9C%EB%A7%88%EC%9D%84%20%EB%8B%A4%EB%9E%91%EC%9D%B4%20%EB%85%BC.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File%3A%EB%82%A8%ED%95%B4_%EA%B0%80%EC%B2%9C%EB%A7%88%EC%9D%84_%EB%8B%A4%EB%9E%91%EC%9D%B4_%EB%85%BC.jpg",
      "photoCredit": "Wikimedia Commons · Korea Heritage Service · CC BY-SA 4.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "changwon-house",
      "kind": "spot",
      "name": "창원의집",
      "region": "경남 · 창원",
      "category": "culture",
      "lead": "창원의 전통 가옥과 뜰을 둘러봅니다.",
      "description": "창원의 전통 가옥과 뜰을 둘러봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "경남 창원 창원의집",
      "source": "https://www.openstreetmap.org/way/1330579020",
      "parking": {
        "lat": 35.2439273,
        "lng": 128.6810458,
        "osm": "https://www.openstreetmap.org/way/1330579021",
        "distanceToPlaceMeters": 70,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "",
      "photoSource": "",
      "photoCredit": "",
      "photoKind": ""
    },
    {
      "id": "geoje-pow-park",
      "kind": "spot",
      "name": "거제포로수용소유적공원",
      "region": "경남 · 거제",
      "category": "culture",
      "lead": "전쟁의 흔적이 남은 전시 구역을 둘러봅니다.",
      "description": "전쟁의 흔적이 남은 전시 구역을 둘러봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "경남 거제 거제포로수용소유적공원",
      "source": "https://www.openstreetmap.org/way/82010112",
      "parking": {
        "lat": 34.8744509,
        "lng": 128.6265026,
        "osm": "https://www.openstreetmap.org/way/460867032",
        "distanceToPlaceMeters": 244,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Geoje-POW%20Camp%20entrance.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Geoje-POW_Camp_entrance.jpg",
      "photoCredit": "Wikimedia Commons · Kang Byeong Kee · CC BY-SA 3.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "ulsan-bridge-viewpoint",
      "kind": "spot",
      "name": "울산대교전망대",
      "region": "울산 · 동구",
      "category": "nature",
      "lead": "울산항과 대교를 높은 곳에서 봅니다.",
      "description": "울산항과 대교를 높은 곳에서 봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "울산 동구 울산대교전망대",
      "source": "https://www.openstreetmap.org/way/899741021",
      "parking": {
        "lat": 35.5016642,
        "lng": 129.4064511,
        "osm": "https://www.openstreetmap.org/way/899741023",
        "distanceToPlaceMeters": 31,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "",
      "photoSource": "",
      "photoCredit": "",
      "photoKind": ""
    },
    {
      "id": "gyeongpodae",
      "kind": "spot",
      "name": "경포대",
      "region": "강원 · 강릉",
      "category": "culture",
      "lead": "경포호와 바다를 잇는 누각을 찾습니다.",
      "description": "경포호와 바다를 잇는 누각을 찾습니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "강원 강릉 경포대",
      "source": "https://www.openstreetmap.org/way/468962074",
      "parking": {
        "lat": 37.7960585,
        "lng": 128.8969071,
        "osm": "https://www.openstreetmap.org/way/1521351853",
        "distanceToPlaceMeters": 139,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Gyeongpo%20Lake%20Cherry%20Blossoms.JPG?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Gyeongpo_Lake_Cherry_Blossoms.JPG",
      "photoCredit": "Wikimedia Commons · Scroozle · CC BY-SA 3.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "sokcho-joyang-site",
      "kind": "spot",
      "name": "속초 조양동 유적",
      "region": "강원 · 속초",
      "category": "culture",
      "lead": "속초의 선사 유적을 짧게 살펴봅니다.",
      "description": "속초의 선사 유적을 짧게 살펴봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "강원 속초 속초 조양동 유적",
      "source": "https://www.openstreetmap.org/node/1899068038",
      "parking": {
        "lat": 38.18878,
        "lng": 128.5902589,
        "osm": "https://www.openstreetmap.org/way/1479169879",
        "distanceToPlaceMeters": 77,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Amlou2518%20%EC%A1%B0%EC%96%91%EB%8F%99%20%EC%9C%A0%EC%A0%811.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Amlou2518_%EC%A1%B0%EC%96%91%EB%8F%99_%EC%9C%A0%EC%A0%811.jpg",
      "photoCredit": "Wikimedia Commons · Amlou2518 · CC BY-SA 4.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "windy-hill",
      "kind": "spot",
      "name": "바람의언덕",
      "region": "경남 · 거제",
      "category": "nature",
      "lead": "해금강 곁의 바다와 언덕을 바라봅니다.",
      "description": "해금강 곁의 바다와 언덕을 바라봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "경남 거제 바람의언덕",
      "source": "https://www.openstreetmap.org/way/241976359",
      "parking": {
        "lat": 34.7422382,
        "lng": 128.66290818,
        "osm": "https://www.openstreetmap.org/way/480311919",
        "distanceToPlaceMeters": 123,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/2014%EB%85%84%205%EC%9B%94%2025%EC%9D%BC%20%EA%B2%BD%EC%83%81%EB%82%A8%EB%8F%84%20%EA%B1%B0%EC%A0%9C%EC%8B%9C%20%EB%B0%94%EB%9E%8C%EC%9D%98%EC%96%B8%EB%8D%9517.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File:2014%EB%85%84_5%EC%9B%94_25%EC%9D%BC_%EA%B2%BD%EC%83%81%EB%82%A8%EB%8F%84_%EA%B1%B0%EC%A0%9C%EC%8B%9C_%EB%B0%94%EB%9E%8C%EC%9D%98%EC%96%B8%EB%8D%9517.jpg",
      "photoCredit": "Wikimedia Commons · 최광모 · CC BY-SA 4.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "mokpo-literature-museum",
      "kind": "spot",
      "name": "목포문학관",
      "region": "전남 · 목포",
      "category": "culture",
      "lead": "목포의 문학과 해안 도시의 이야기를 만납니다.",
      "description": "목포의 문학과 해안 도시의 이야기를 만납니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "전남 목포 목포문학관",
      "source": "https://www.openstreetmap.org/node/368635740",
      "parking": {
        "lat": 34.791741,
        "lng": 126.4167419,
        "osm": "https://www.openstreetmap.org/way/696364570",
        "distanceToPlaceMeters": 116,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "",
      "photoSource": "",
      "photoCredit": "",
      "photoKind": ""
    },
    {
      "id": "jeongdongjin-beach",
      "kind": "spot",
      "name": "정동진해변",
      "region": "강원 · 강릉",
      "category": "nature",
      "lead": "정동진의 바다와 해안선을 바라봅니다.",
      "description": "정동진의 바다와 해안선을 바라봅니다. 바이크는 주차 구역에 세우고 가까운 관람 지점까지 걸어가세요.",
      "note": "개방·주차 운영 조건을 방문 전 확인하세요. 한 시간 이내 방문 동선으로 계획하세요.",
      "address": "강원 강릉 정동진해변",
      "source": "https://www.openstreetmap.org/way/510170613",
      "parking": {
        "lat": 37.6942577,
        "lng": 129.0287705,
        "osm": "https://www.openstreetmap.org/way/470665702",
        "distanceToPlaceMeters": 186,
        "evidence": "OSM amenity=parking, access not restricted, motorcycle road snap verified 2026-09-28"
      },
      "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Jeongdongjin%20Beach.jpg?width=960",
      "photoSource": "https://commons.wikimedia.org/wiki/File%3AJeongdongjin_Beach.jpg",
      "photoCredit": "Wikimedia Commons · Loewelad · CC BY-SA 3.0",
      "photoKind": "PLACE_PHOTO"
    },
    {
      "id": "haesindang-park",
      "kind": "spot",
      "name": "해신당공원",
      "region": "강원 삼척",
      "category": "nature",
      "lead": "동해를 바라보는 해안 공원의 조각과 풍경.",
      "description": "관람은 공원 해안 구간 위주로 짧게 잡고, 바이크는 방문자 주차장에 세우세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "강원 삼척 해신당공원",
      "source": "https://www.openstreetmap.org/way/38482067",
      "visitCoordinate": [
        37.2701868,
        129.3257143
      ],
      "parking": {
        "lat": 37.2667403,
        "lng": 129.3280463,
        "osm": "https://www.openstreetmap.org/way/376791224",
        "distanceToPlaceMeters": 435,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "muwisa",
      "kind": "spot",
      "name": "무위사",
      "region": "전남 강진",
      "category": "culture",
      "lead": "월출산 아래에서 만나는 오래된 절집.",
      "description": "극락보전과 경내를 둘러보는 짧은 방문에 어울립니다. 입구 주차장에서 걸어 들어가세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "전남 강진 무위사",
      "source": "https://www.openstreetmap.org/way/786997328",
      "visitCoordinate": [
        34.7383378,
        126.6867814
      ],
      "parking": {
        "lat": 34.7372143,
        "lng": 126.6875919,
        "osm": "https://www.openstreetmap.org/way/1263142468",
        "distanceToPlaceMeters": 145,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "neungsan-tombs",
      "kind": "spot",
      "name": "부여 능산리 고분군",
      "region": "충남 부여",
      "category": "culture",
      "lead": "부여의 낮은 언덕에 이어지는 백제 고분.",
      "description": "고분군의 산책 구간을 둘러보고 쉬어 갑니다. 주차장에 세운 뒤 지정된 관람로를 이용하세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "충남 부여 부여 능산리 고분군",
      "source": "https://www.openstreetmap.org/way/472265679",
      "visitCoordinate": [
        36.2777012,
        126.9423305
      ],
      "parking": {
        "lat": 36.2767377,
        "lng": 126.9454388,
        "osm": "https://www.openstreetmap.org/way/586476879",
        "distanceToPlaceMeters": 299,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "geumdangsa",
      "kind": "spot",
      "name": "금당사",
      "region": "전북 진안",
      "category": "culture",
      "lead": "마이산 남쪽에서 만나는 금당사.",
      "description": "경내와 주변 풍경을 짧게 살펴보세요. 마이산 남부 주차장을 이용하고 등산 코스는 동선에서 제외합니다.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "전북 진안 금당사",
      "source": "https://www.openstreetmap.org/node/368861660",
      "visitCoordinate": [
        35.7578195,
        127.3975733
      ],
      "parking": {
        "lat": 35.7565379,
        "lng": 127.3935264,
        "osm": "https://www.openstreetmap.org/way/158176963",
        "distanceToPlaceMeters": 392,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "baekyangsa",
      "kind": "spot",
      "name": "백양사",
      "region": "전남 장성",
      "category": "culture",
      "lead": "백암산 아래, 숲과 절집이 어우러지는 곳.",
      "description": "경내와 입구의 풍경을 중심으로 머무릅니다. 주차 후 걸어 방문하며 산행은 계획에 포함하지 않습니다.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "전남 장성 백양사",
      "source": "https://www.openstreetmap.org/node/368861693",
      "visitCoordinate": [
        35.4395106,
        126.8831902
      ],
      "parking": {
        "lat": 35.4364616,
        "lng": 126.8843637,
        "osm": "https://www.openstreetmap.org/way/1250192077",
        "distanceToPlaceMeters": 355,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "wonju-hyanggyo",
      "kind": "spot",
      "name": "원주향교",
      "region": "강원 원주",
      "category": "culture",
      "lead": "원주 도심에서 만나는 향교의 고즈넉한 마당.",
      "description": "향교 건물과 주변을 잠시 둘러보며 쉬어 갑니다. 관람 가능한 구간에서 조용히 방문하세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "강원 원주 원주향교",
      "source": "https://www.openstreetmap.org/way/1104362563",
      "visitCoordinate": [
        37.3389807,
        127.9493773
      ],
      "parking": {
        "lat": 37.3380561,
        "lng": 127.9498573,
        "osm": "https://www.openstreetmap.org/way/1104974926",
        "distanceToPlaceMeters": 111,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "ssanggyesa",
      "kind": "spot",
      "name": "쌍계사",
      "region": "경남 하동",
      "category": "culture",
      "lead": "지리산 자락의 쌍계사에서 잠시 쉬어 갑니다.",
      "description": "방문자 주차장에 세운 뒤 경내를 중심으로 둘러보세요. 산으로 이어지는 길은 경유 동선에서 제외합니다.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "경남 하동 쌍계사",
      "source": "https://www.openstreetmap.org/way/787003589",
      "visitCoordinate": [
        35.2327163,
        127.6501763
      ],
      "parking": {
        "lat": 35.2317159,
        "lng": 127.647132,
        "osm": "https://www.openstreetmap.org/way/1209669988",
        "distanceToPlaceMeters": 298,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "unmunsa",
      "kind": "spot",
      "name": "운문사",
      "region": "경북 청도",
      "category": "culture",
      "lead": "솔숲과 절집이 어우러진 청도의 산사.",
      "description": "운문사 경내와 처진 소나무를 살펴보는 짧은 방문을 계획해 보세요. 수행 공간의 출입 안내를 따르세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "경북 청도 운문사",
      "source": "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=1512da5d-3887-4c94-b8fa-17aa3bcc0caa",
      "visitCoordinate": [
        35.6607375,
        128.9602296
      ],
      "parking": {
        "lat": 35.6627414,
        "lng": 128.9607373,
        "osm": "https://www.openstreetmap.org/way/759791063",
        "distanceToPlaceMeters": 227,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "bulguksa",
      "kind": "spot",
      "name": "불국사",
      "region": "경북 경주",
      "category": "culture",
      "lead": "경주의 대표 사찰에서 만나는 석탑과 전각.",
      "description": "주차장에서 걸어 들어가 경내를 둘러봅니다. 관람객이 많은 시간에는 주차와 입장 대기 시간을 고려하세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "경북 경주 불국사",
      "source": "https://www.openstreetmap.org/way/382655135",
      "visitCoordinate": [
        35.7894072,
        129.3320396
      ],
      "parking": {
        "lat": 35.7865579,
        "lng": 129.3323746,
        "osm": "https://www.openstreetmap.org/way/161547558",
        "distanceToPlaceMeters": 318,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "naksansa",
      "kind": "spot",
      "name": "낙산사",
      "region": "강원 양양",
      "category": "culture",
      "lead": "양양 바다를 내려다보는 낙산사.",
      "description": "주차 후 경내와 해안 전망 구간을 둘러보세요. 한 시간 안에 돌아올 수 있도록 관람 구간을 정합니다.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "강원 양양 낙산사",
      "source": "https://www.openstreetmap.org/node/1141919810",
      "visitCoordinate": [
        38.124506,
        128.6291359
      ],
      "parking": {
        "lat": 38.1239821,
        "lng": 128.6313091,
        "osm": "https://www.openstreetmap.org/way/1297341425",
        "distanceToPlaceMeters": 199,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "sinheungsa",
      "kind": "spot",
      "name": "신흥사",
      "region": "강원 속초",
      "category": "culture",
      "lead": "설악산 입구에서 만나는 신흥사.",
      "description": "주차 후 통일대불과 경내를 중심으로 잠시 둘러봅니다. 설악산 등산 코스는 경유 동선에서 제외합니다.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "강원 속초 신흥사",
      "source": "https://www.openstreetmap.org/node/444216838",
      "visitCoordinate": [
        38.1753764,
        128.4847028
      ],
      "parking": {
        "lat": 38.1745528,
        "lng": 128.4881145,
        "osm": "https://www.openstreetmap.org/way/1255224783",
        "distanceToPlaceMeters": 312,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "woljeongsa",
      "kind": "spot",
      "name": "월정사",
      "region": "강원 평창",
      "category": "culture",
      "lead": "오대산 숲에 둘러싸인 월정사.",
      "description": "팔각 구층석탑과 경내를 짧게 둘러봅니다. 산행 대신 주차장과 경내를 오가는 방문으로 계획하세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "강원 평창 월정사",
      "source": "https://www.openstreetmap.org/way/476358120",
      "visitCoordinate": [
        37.7318517,
        128.5929594
      ],
      "parking": {
        "lat": 37.7303895,
        "lng": 128.5953146,
        "osm": "https://www.openstreetmap.org/way/1319746153",
        "distanceToPlaceMeters": 263,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "ondal-park",
      "kind": "spot",
      "name": "온달관광지",
      "region": "충북 단양",
      "category": "culture",
      "lead": "남한강 가까이에서 만나는 온달관광지.",
      "description": "관광지의 촬영 세트 구간을 중심으로 둘러봅니다. 동굴이나 산성까지 모두 방문하는 긴 동선은 피하세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "충북 단양 온달관광지",
      "source": "https://freetour.chungbuk.go.kr/www/selectTourCntntsWebView.do?ctgry=3&key=3&tourNo=673",
      "visitCoordinate": [
        37.0631431,
        128.491136
      ],
      "parking": {
        "lat": 37.0626521,
        "lng": 128.4938003,
        "osm": "https://www.openstreetmap.org/way/1039806895",
        "distanceToPlaceMeters": 243,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "seosan-birdland",
      "kind": "spot",
      "name": "서산버드랜드",
      "region": "충남 서산",
      "category": "nature",
      "lead": "천수만의 자연을 살펴보는 서산버드랜드.",
      "description": "전시관과 가까운 관람 구간을 둘러보며 쉬어 갑니다. 방문자 주차장에 세운 뒤 도보로 이동하세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "충남 서산 서산버드랜드",
      "source": "https://www.openstreetmap.org/node/8046892990",
      "visitCoordinate": [
        36.6307149,
        126.3784113
      ],
      "parking": {
        "lat": 36.6289705,
        "lng": 126.3778664,
        "osm": "https://www.openstreetmap.org/way/936685097",
        "distanceToPlaceMeters": 200,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "borimsa",
      "kind": "spot",
      "name": "보림사",
      "region": "전남 장흥",
      "category": "culture",
      "lead": "장흥의 산자락에서 만나는 보림사의 석탑.",
      "description": "주차장에서 가까운 경내를 둘러봅니다. 석탑과 석등 주변에서 잠시 머물며 길의 리듬을 바꿔 보세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "전남 장흥 보림사",
      "source": "https://www.openstreetmap.org/way/489805519",
      "visitCoordinate": [
        34.807663,
        126.8969535
      ],
      "parking": {
        "lat": 34.8072237,
        "lng": 126.8977631,
        "osm": "https://www.openstreetmap.org/way/1533774448",
        "distanceToPlaceMeters": 89,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "jeongamsa",
      "kind": "spot",
      "name": "정암사",
      "region": "강원 정선",
      "category": "culture",
      "lead": "정선의 산사에서 만나는 수마노탑.",
      "description": "입구 주차장에 세운 뒤 경내를 둘러봅니다. 탑으로 오르는 구간은 남은 시간과 보행 여건을 보고 선택하세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "강원 정선 정암사",
      "source": "https://dh.aks.ac.kr/~heritage/wiki/index.php/%EC%A0%95%EC%84%A0%20%EC%A0%95%EC%95%94%EC%82%AC",
      "visitCoordinate": [
        37.1830427,
        128.8926904
      ],
      "parking": {
        "lat": 37.1844701,
        "lng": 128.8910849,
        "osm": "https://www.openstreetmap.org/way/671833971",
        "distanceToPlaceMeters": 213,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "jangneung",
      "kind": "spot",
      "name": "영월 장릉",
      "region": "강원 영월",
      "category": "culture",
      "lead": "영월의 숲과 왕릉을 따라 걷는 짧은 산책.",
      "description": "장릉의 가까운 관람 구간을 중심으로 둘러보세요. 주차장에 바이크를 세우고 지정된 관람로를 이용합니다.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "강원 영월 영월 장릉",
      "source": "https://www.openstreetmap.org/node/4294350409",
      "visitCoordinate": [
        37.1952294,
        128.4545672
      ],
      "parking": {
        "lat": 37.1962891,
        "lng": 128.4552279,
        "osm": "https://www.openstreetmap.org/way/1408706872",
        "distanceToPlaceMeters": 132,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "uam-park",
      "kind": "spot",
      "name": "우암사적공원",
      "region": "대전 동구",
      "category": "culture",
      "lead": "대전에서 만나는 전통 건물과 연못의 풍경.",
      "description": "우암사적공원의 마당과 연못 주변을 천천히 둘러봅니다. 입구 주차장에서 도보로 이동하세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "대전 동구 우암사적공원",
      "source": "https://blog.naver.com/storydaejeon/223417631280",
      "visitCoordinate": [
        36.3476793,
        127.4580285
      ],
      "parking": {
        "lat": 36.3470937,
        "lng": 127.4570502,
        "osm": "https://www.openstreetmap.org/way/788718695",
        "distanceToPlaceMeters": 109,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "yeongamsa-site",
      "kind": "spot",
      "name": "합천 영암사지",
      "region": "경남 합천",
      "category": "culture",
      "lead": "모산재 아래 남아 있는 옛 절터와 석조 유산.",
      "description": "영암사지의 석탑과 석등 주변을 짧게 둘러봅니다. 산으로 오르는 등산로는 이용하지 않습니다.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "경남 합천 합천 영암사지",
      "source": "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=1f341182-23a3-46c2-a5d9-fee4e7e742ab",
      "visitCoordinate": [
        35.4744287,
        128.003269
      ],
      "parking": {
        "lat": 35.4746263,
        "lng": 128.0041548,
        "osm": "https://www.openstreetmap.org/way/1255056700",
        "distanceToPlaceMeters": 83,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "hapdeok-church",
      "kind": "spot",
      "name": "합덕성당",
      "region": "충남 당진",
      "category": "culture",
      "lead": "당진의 들판 가까이 자리한 합덕성당.",
      "description": "성당 외관과 개방된 주변 공간을 짧게 둘러봅니다. 종교 행사 중에는 관람 안내를 따르고 조용히 방문하세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "충남 당진 합덕성당",
      "source": "https://www.openstreetmap.org/node/3321572961",
      "visitCoordinate": [
        36.7929493,
        126.7856894
      ],
      "parking": {
        "lat": 36.7937819,
        "lng": 126.7836221,
        "osm": "https://www.openstreetmap.org/way/1311664428",
        "distanceToPlaceMeters": 206,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "inje-hyanggyo",
      "kind": "spot",
      "name": "인제향교",
      "region": "강원 인제",
      "category": "culture",
      "lead": "인제 읍내에서 만나는 향교의 전통 건물.",
      "description": "가까운 주차장에 세운 뒤 향교 주변을 짧게 둘러봅니다. 내부 관람은 개방 여부를 확인한 뒤 진행하세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "강원 인제 인제향교",
      "source": "https://www.openstreetmap.org/way/1315480995",
      "visitCoordinate": [
        38.0720606,
        128.1746633
      ],
      "parking": {
        "lat": 38.071584,
        "lng": 128.1743788,
        "osm": "https://www.openstreetmap.org/way/577849781",
        "distanceToPlaceMeters": 59,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    },
    {
      "id": "malisan-tombs",
      "kind": "spot",
      "name": "함안 말이산 고분군",
      "region": "경남 함안",
      "category": "culture",
      "lead": "함안의 낮은 언덕을 따라 이어지는 가야 고분.",
      "description": "함안박물관 쪽에서 가까운 고분군 산책 구간을 둘러봅니다. 전체 순환 대신 한 시간 안에 돌아올 구간을 정하세요.",
      "note": "방문 전 개방·주차 운영 안내를 확인하세요. 바이크는 주차 구역에 세우고 한 시간 이내로 관람하세요.",
      "address": "경남 함안 함안 말이산 고분군",
      "source": "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=8c49ce7a-4155-47a4-8fd7-e7bc2e94a047",
      "visitCoordinate": [
        35.273611,
        128.404722
      ],
      "parking": {
        "lat": 35.2726901,
        "lng": 128.4066759,
        "osm": "https://www.openstreetmap.org/way/566754334",
        "distanceToPlaceMeters": 205,
        "evidence": "OSM 주차 구역과 출입 제한 태그 대조; 이륜차 통행 가능 도로 연결 확인 2026-10-04"
      }
    }
  ],
  "photosById": {
    "sokcho": {
      "image": "/web/app/assets/spots/sokcho.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Sokcho_Beach_01.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/2/28/Sokcho_Beach_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Grapesurgeon · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "jinha": {
      "image": "/web/app/assets/spots/jinha.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Sunrise_(169520597).jpeg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Sunrise_%28169520597%29.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Jh Jung · CC BY 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "gwangalli": {
      "image": "/web/app/assets/spots/gwangalli.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Sunrise_at_Gwangalli_Beach,_Busan.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Sunrise_at_Gwangalli_Beach%2C_Busan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "VN.NguyenDucDuy · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "songjeong": {
      "image": "/web/app/assets/spots/songjeong.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Songjeong_Beach.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Songjeong_Beach.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Andrewssi2 · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "oryukdo-skywalk": {
      "image": "/web/app/assets/spots/oryukdo-skywalk.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Oryukdo_Skywalk_in_Busan,_South_Korea.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/52/Oryukdo_Skywalk_in_Busan%2C_South_Korea.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Choi2451 · CC0 · WebP 변환·축소",
      "photoLicense": "CC0",
      "photoLicenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "gamcheon": {
      "image": "/web/app/assets/spots/gamcheon.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Gamcheon_Colored_Houses,_Busan,_Korea.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/4/49/Gamcheon_Colored_Houses%2C_Busan%2C_Korea.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Ken Eckert · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "eulsukdo": {
      "image": "/web/app/assets/spots/eulsukdo.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Saha-gu_eulsuk-do.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/3/37/Saha-gu_eulsuk-do.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "FriedC · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "suro-tomb": {
      "image": "/web/app/assets/spots/suro-tomb.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Suro_Tomb.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/59/Suro_Tomb.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Kwj2772 · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "bongha": {
      "image": "/web/app/assets/spots/bongha.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Roh_Moo-hyun%27s_House.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/7/73/Roh_Moo-hyun%27s_House.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "G43 · CC BY 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "tongdosa": {
      "image": "/web/app/assets/spots/tongdosa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Tongdosa-09.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/05/Korea-Tongdosa-09.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814 at English Wikipedia · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "yeongnamru": {
      "image": "/web/app/assets/spots/yeongnamru.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Yeongnamru_Miryang_Gyeongsangnamdo.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/2/28/Yeongnamru_Miryang_Gyeongsangnamdo.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Maru4u · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "pyochungsa": {
      "image": "/web/app/assets/spots/pyochungsa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Miryang_Pyochungsa.png",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Miryang_Pyochungsa.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Roadgo · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "jinjuseong": {
      "image": "/web/app/assets/spots/jinjuseong.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Jinju_castle-Chosuk_gate.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Jinju_castle-Chosuk_gate.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Kang Byeong Kee · CC BY 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "samcheonpo-bridge": {
      "image": "/web/app/assets/spots/samcheonpo-bridge.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Changsun_Sachunpo_Bridge.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Changsun_Sachunpo_Bridge.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Woohyong · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "choechampan-house": {
      "image": "/web/app/assets/spots/choechampan-house.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%B5%9C%EC%B0%B8%ED%8C%90%EB%8C%81_%EC%82%AC%EB%9E%91%EC%B1%84.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/5e/%EC%B5%9C%EC%B0%B8%ED%8C%90%EB%8C%81_%EC%82%AC%EB%9E%91%EC%B1%84.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Gcd822 · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "hwagae-market": {
      "image": "/web/app/assets/spots/hwagae-market.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Hadong-Hwagae.jangteo-Market-01.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/f/f7/Korea-Hadong-Hwagae.jangteo-Market-01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "by eimoberg · CC BY 2.0 · WebP 변환·축소",
      "photoLicense": "CC BY 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "donguibogam-village": {
      "image": "/web/app/assets/spots/donguibogam-village.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Sancheong_Gun_51_(16666146226).jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/d/d1/Sancheong_Gun_51_%2816666146226%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Republic of Korea from Seoul, Republic of Korea · CC BY-SA 2.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "sangnim-forest": {
      "image": "/web/app/assets/spots/sangnim-forest.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Hamyang_Sangrim.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Hamyang_Sangrim.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "HappyMidnight · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "suseungdae": {
      "image": "/web/app/assets/spots/suseungdae.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Suseungdae2.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/1/17/Suseungdae2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Dittwjfsdgkvkdjg · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "dongpirang": {
      "image": "/web/app/assets/spots/dongpirang.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Tongyeong-Dongpirang_Village-10.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/1/12/Korea-Tongyeong-Dongpirang_Village-10.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "by Junho Jung at Flickr from South Korea · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "hwaeomsa": {
      "image": "/web/app/assets/spots/hwaeomsa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%ED%99%94%EC%97%84%EC%82%AC3.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/7/76/%ED%99%94%EC%97%84%EC%82%AC3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "(c)한국불교문화사업단, culturalcorpsofkoreanbuddhism · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "maehwa-village": {
      "image": "/web/app/assets/spots/maehwa-village.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Gwangyang_Maehwa_Festival_in_Spring_-_4402789449.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/4/49/Gwangyang_Maehwa_Festival_in_Spring_-_4402789449.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Korea.net / Korean Culture and Information Service (Photographer name) · CC BY-SA 2.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "naganeupseong": {
      "image": "/web/app/assets/spots/naganeupseong.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EB%82%99%EC%95%88%EC%9D%8D%EC%84%B1%EC%A0%84%EA%B2%BD.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/2/2e/%EB%82%99%EC%95%88%EC%9D%8D%EC%84%B1%EC%A0%84%EA%B2%BD.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Minquddyd · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "suncheon-bay": {
      "image": "/web/app/assets/spots/suncheon-bay.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Suncheon_Ecological_Bay-_%EC%88%9C%EC%B2%9C%EB%A7%8C%EC%8A%B5%EC%A7%80.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Suncheon_Ecological_Bay-_%EC%88%9C%EC%B2%9C%EB%A7%8C%EC%8A%B5%EC%A7%80.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Joycekim77 · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "daehan-dawon": {
      "image": "/web/app/assets/spots/daehan-dawon.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EB%8C%80%ED%95%9C%EB%8B%A4%EC%9B%90_%EC%B0%A8%EB%B0%AD.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/c/cf/%EB%8C%80%ED%95%9C%EB%8B%A4%EC%9B%90_%EC%B0%A8%EB%B0%AD.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Jocelyndurrey · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "juknokwon": {
      "image": "/web/app/assets/spots/juknokwon.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Damyang_Jungnogwon_(1).jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Damyang_Jungnogwon_%281%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Christian Bolz (크리스티안 볼츠) · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "unjusa": {
      "image": "/web/app/assets/spots/unjusa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Unjusa_4507-07_Cilcheung_Seoktap_facing_Unjusa_Seokjo_Bulgam.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c2/Korea-Unjusa_4507-07_Cilcheung_Seoktap_facing_Unjusa_Seokjo_Bulgam.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814 · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "geumseonggwan": {
      "image": "/web/app/assets/spots/geumseonggwan.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EB%82%98%EC%A3%BC%EA%B8%88%EC%84%B1%EA%B4%80.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/2/21/%EB%82%98%EC%A3%BC%EA%B8%88%EC%84%B1%EA%B4%80.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Kyklyj · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "dasan-chodang": {
      "image": "/web/app/assets/spots/dasan-chodang.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Dasanchodang_(%E8%8C%B6%E5%B1%B1%E8%8D%89%E5%A0%82)_-_panoramio.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/04/Dasanchodang_%28%E8%8C%B6%E5%B1%B1%E8%8D%89%E5%A0%82%29_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Cho's · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "seonamsa": {
      "image": "/web/app/assets/spots/seonamsa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Seonamsa_Iljumun_11-06782.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/05/Seonamsa_Iljumun_11-06782.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814 · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "soswaewon": {
      "image": "/web/app/assets/spots/soswaewon.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:KOCIS_Korea_Soswaewon_01_(7581350982).jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/a/aa/KOCIS_Korea_Soswaewon_01_%287581350982%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Korea.net / Korean Culture and Information Service (Photographer name) · CC BY-SA 2.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "gwanghallu": {
      "image": "/web/app/assets/spots/gwanghallu.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Nawon-Kwanghanlu2.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/f/f2/Korea-Nawon-Kwanghanlu2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Asfreeas · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "honbul-museum": {
      "image": "/web/app/assets/spots/honbul-museum.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%ED%98%BC%EB%B6%88%EB%AC%B8%ED%95%99%EA%B4%80.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/6/6b/%ED%98%BC%EB%B6%88%EB%AC%B8%ED%95%99%EA%B4%80.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "이충재-PHOTO SALON · CC BY 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "jeonju-hanok": {
      "image": "/web/app/assets/spots/jeonju-hanok.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%A0%84%EC%A3%BC%ED%95%9C%EC%98%A5%EB%A7%88%EC%9D%84_%EC%A0%84%EA%B2%BD.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/f/f2/%EC%A0%84%EC%A3%BC%ED%95%9C%EC%98%A5%EB%A7%88%EC%9D%84_%EC%A0%84%EA%B2%BD.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Songk1122 · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "seonunsa": {
      "image": "/web/app/assets/spots/seonunsa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%84%A0%EC%9A%B4%EC%82%AC_%EC%9D%BC%EC%A3%BC%EB%AC%B8.jpeg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/1/16/%EC%84%A0%EC%9A%B4%EC%82%AC_%EC%9D%BC%EC%A3%BC%EB%AC%B8.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "나랑드 · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "gochang-fortress": {
      "image": "/web/app/assets/spots/gochang-fortress.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EA%B3%A0%EC%B0%BD%EC%9D%8D%EC%84%B1%EC%9D%98_%EB%B4%84.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/e/e6/%EA%B3%A0%EC%B0%BD%EC%9D%8D%EC%84%B1%EC%9D%98_%EB%B4%84.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Leeyoungbum · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "chaeseokgang": {
      "image": "/web/app/assets/spots/chaeseokgang.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Buan_County-Chaeseokgang-01.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Korea-Buan_County-Chaeseokgang-01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Byungjoon Kim · CC BY 2.0 · WebP 변환·축소",
      "photoLicense": "CC BY 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "gunsan-history": {
      "image": "/web/app/assets/spots/gunsan-history.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Entrance_of_Gunsan_Modern_History_Museum.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/6/6a/Entrance_of_Gunsan_Modern_History_Museum.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Dquai · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "byeokgolje": {
      "image": "/web/app/assets/spots/byeokgolje.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EB%B2%BD%EA%B3%A8%EC%A0%9C.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/e/ec/%EB%B2%BD%EA%B3%A8%EC%A0%9C.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Kyklyj · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "naesosa": {
      "image": "/web/app/assets/spots/naesosa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Naesosa_temple.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/09/Naesosa_temple.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Jo · CC BY 2.0 · WebP 변환·축소",
      "photoLicense": "CC BY 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "mireuksa": {
      "image": "/web/app/assets/spots/mireuksa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%9D%B5%EC%82%B0_%EB%AF%B8%EB%A5%B5%EC%82%AC%EC%A7%80_%EC%84%9D%ED%83%91(2019%EB%85%84)_%EC%95%BC%EA%B2%BD.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/f/fa/%EC%9D%B5%EC%82%B0_%EB%AF%B8%EB%A5%B5%EC%82%AC%EC%A7%80_%EC%84%9D%ED%83%91%282019%EB%85%84%29_%EC%95%BC%EA%B2%BD.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "문화재청 · KOGL Type 1 · WebP 변환·축소",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "https://www.kogl.or.kr/info/licenseType1.do",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "chueam-beach": {
      "image": "/web/app/assets/spots/chueam-beach.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%B6%94%EC%95%94%ED%95%B4%EC%88%98%EC%9A%95%EC%9E%A5.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/b/bb/%EC%B6%94%EC%95%94%ED%95%B4%EC%88%98%EC%9A%95%EC%9E%A5.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "산야바다 · CC BY-SA 2.0 kr · WebP 변환·축소",
      "photoLicense": "CC BY-SA 2.0 kr",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.0/kr/deed.en",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "poseokjeong": {
      "image": "/web/app/assets/spots/poseokjeong.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Gyeongju-Poseokjeong_site_3832-06.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/d/db/Korea-Gyeongju-Poseokjeong_site_3832-06.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814 · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "unilam-banilam": {
      "image": "/web/app/assets/spots/unilam-banilam.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:JJ-UB-Natl-Geopark.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/0c/JJ-UB-Natl-Geopark.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Dittwjfsdgkvkdjg · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "yangdong-village": {
      "image": "/web/app/assets/spots/yangdong-village.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Yangdong_Village_04.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/a/aa/Yangdong_Village_04.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Bernard Gagnon · CC0 · WebP 변환·축소",
      "photoLicense": "CC0",
      "photoLicenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "jangsaengpo-whale": {
      "image": "/web/app/assets/spots/jangsaengpo-whale.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Jangsaengpo_Whale_Museum_02.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/a/ac/Jangsaengpo_Whale_Museum_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Korea Tourism Organization, Lee Bumsu · KOGL Type 1 · WebP 변환·축소",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "https://www.kogl.or.kr/info/licenseType1.do",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "gochang-dolmen-museum": {
      "image": "/web/app/assets/spots/gochang-dolmen-museum.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Gochang_Dolmens_Skyline,_South_Korea.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/4/44/Gochang_Dolmens_Skyline%2C_South_Korea.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Lance Vanlewen · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "national-lighthouse-museum": {
      "image": "/web/app/assets/spots/national-lighthouse-museum.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Lighthouse_museum_entrance.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/4/41/Lighthouse_museum_entrance.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "User:Altostratus · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "cheongju-national-museum": {
      "image": "/web/app/assets/spots/cheongju-national-museum.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Cheongju_National_Museum.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Cheongju_National_Museum.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Kim Jiho, Korea Tourism Organization · KOGL Type 1 · WebP 변환·축소",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "https://www.kogl.or.kr/info/licenseType1.do",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "gameunsa-site": {
      "image": "/web/app/assets/spots/gameunsa-site.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Gyeongju-Gameunsa_temple_site_remains-02.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Korea-Gyeongju-Gameunsa_temple_site_remains-02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "by Junho Jung at Flickr from South Korea · CC BY 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "donggung-wolji": {
      "image": "/web/app/assets/spots/donggung-wolji.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Water_reflection_of_Donggung_Palace_in_Wolji_Pond_at_blue_hour_in_Gyeongju_South_Korea.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Water_reflection_of_Donggung_Palace_in_Wolji_Pond_at_blue_hour_in_Gyeongju_South_Korea.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Basile Morin · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "piram-seowon": {
      "image": "/web/app/assets/spots/piram-seowon.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Piramseowon_Confucian_Academy,_Hwakyeonru.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/05/Piramseowon_Confucian_Academy%2C_Hwakyeonru.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Trainholic · CC BY 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "busan-maritime-museum": {
      "image": "/web/app/assets/spots/busan-maritime-museum.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:National_Maritime_Museum_(16920202960).jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/d/d0/National_Maritime_Museum_%2816920202960%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Marie from Malang, East Java, Indonesia · CC BY-SA 2.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "un-memorial-cemetery": {
      "image": "/web/app/assets/spots/un-memorial-cemetery.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:UN_Memorial_Cemetery.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/3/35/UN_Memorial_Cemetery.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Leon Petrosyan · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "unjoru": {
      "image": "/web/app/assets/spots/unjoru.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%99%B8%EB%B6%80%EC%97%90%EC%84%9C_%EB%B0%94%EB%9D%BC%EB%B3%B8_%EB%8C%80%EB%AC%B8%EC%B1%84.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/e/e8/%EC%99%B8%EB%B6%80%EC%97%90%EC%84%9C_%EB%B0%94%EB%9D%BC%EB%B3%B8_%EB%8C%80%EB%AC%B8%EC%B1%84.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "문화재청 · KOGL Type 1 · WebP 변환·축소",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "https://www.kogl.or.kr/info/licenseType1.do",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "dadaepo-beach": {
      "image": "/web/app/assets/spots/dadaepo-beach.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Dadaepo_Beach,_Busan,_Korea.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/b/ba/Dadaepo_Beach%2C_Busan%2C_Korea.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Ken Eckert · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "boryeong-suyeongseong": {
      "image": "/web/app/assets/spots/boryeong-suyeongseong.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Navy_Headquarters_of_Chungcheong-do_Province,_Boryeong_in_2026_(5).jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Navy_Headquarters_of_Chungcheong-do_Province%2C_Boryeong_in_2026_%285%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Sadopaul · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "clayarch-gimhae": {
      "image": "/web/app/assets/spots/clayarch-gimhae.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Clayarch_Gimhae_Museum.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Clayarch_Gimhae_Museum.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "HappyMidnight · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "chuncheon-national-museum": {
      "image": "/web/app/assets/spots/chuncheon-national-museum.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Chuncheon_National_Museum.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/8/81/Chuncheon_National_Museum.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Trainholic · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "dolsan-park": {
      "image": "/web/app/assets/spots/dolsan-park.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Dolsan_Bridge_Monument_20180929_002.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/9/92/Dolsan_Bridge_Monument_20180929_002.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Mobius6 · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "beomeosa": {
      "image": "/web/app/assets/spots/beomeosa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Interior_view_of_Beomeosa_temple_with_two_Buddhist_monks_in_Busan_South_Korea.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Interior_view_of_Beomeosa_temple_with_two_Buddhist_monks_in_Busan_South_Korea.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Basile Morin · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "mokpo-marine-relics": {
      "image": "/web/app/assets/spots/mokpo-marine-relics.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korean_marine_relic_pavilion,_Mokpo.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Korean_marine_relic_pavilion%2C_Mokpo.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Kussy · CC BY-SA 2.1 jp · WebP 변환·축소",
      "photoLicense": "CC BY-SA 2.1 jp",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "gacheon-terraces": {
      "image": "/web/app/assets/spots/gacheon-terraces.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EB%82%A8%ED%95%B4_%EA%B0%80%EC%B2%9C%EB%A7%88%EC%9D%84_%EB%8B%A4%EB%9E%91%EC%9D%B4_%EB%85%BC.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/1/16/%EB%82%A8%ED%95%B4_%EA%B0%80%EC%B2%9C%EB%A7%88%EC%9D%84_%EB%8B%A4%EB%9E%91%EC%9D%B4_%EB%85%BC.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Korea Heritage Service · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "geoje-pow-park": {
      "image": "/web/app/assets/spots/geoje-pow-park.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Geoje-POW_Camp_entrance.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/d/d1/Geoje-POW_Camp_entrance.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Kang Byeong Kee · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "gyeongpodae": {
      "image": "/web/app/assets/spots/gyeongpodae.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Gyeongpo_Lake_Cherry_Blossoms.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Gyeongpo_Lake_Cherry_Blossoms.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Scroozle · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "windy-hill": {
      "image": "/web/app/assets/spots/windy-hill.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:2014%EB%85%84_5%EC%9B%94_25%EC%9D%BC_%EA%B2%BD%EC%83%81%EB%82%A8%EB%8F%84_%EA%B1%B0%EC%A0%9C%EC%8B%9C_%EB%B0%94%EB%9E%8C%EC%9D%98%EC%96%B8%EB%8D%9517.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/a/aa/2014%EB%85%84_5%EC%9B%94_25%EC%9D%BC_%EA%B2%BD%EC%83%81%EB%82%A8%EB%8F%84_%EA%B1%B0%EC%A0%9C%EC%8B%9C_%EB%B0%94%EB%9E%8C%EC%9D%98%EC%96%B8%EB%8D%9517.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "최광모 · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "jeongdongjin-beach": {
      "image": "/web/app/assets/spots/jeongdongjin-beach.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Jeongdongjin_Beach.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Jeongdongjin_Beach.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Loewelad · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "sangjogam": {
      "image": "/web/app/assets/spots/sangjogam.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:GoseongJin33.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c5/GoseongJin33.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Dittwjfsdgkvkdjg · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "byeongbangchi-skywalk": {
      "image": "/web/app/assets/spots/byeongbangchi-skywalk.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%ED%95%9C%EB%B0%98%EB%8F%84%EC%8A%B5%EC%A7%80.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/b/b7/%ED%95%9C%EB%B0%98%EB%8F%84%EC%8A%B5%EC%A7%80.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Li Monika · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "ulsan-bridge-viewpoint": {
      "image": "/web/app/assets/spots/ulsan-bridge-viewpoint.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Ulsan_Bridge_over_the_Taehwa_River2.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Ulsan_Bridge_over_the_Taehwa_River2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Glabb · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "haesindang-park": {
      "image": "/web/app/assets/spots/haesindang-park.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Penis_park_korea.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/6/6d/Penis_park_korea.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Amanderson · CC BY 2.0 · WebP 변환·축소",
      "photoLicense": "CC BY 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "muwisa": {
      "image": "/web/app/assets/spots/muwisa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EA%B0%95%EC%A7%84%EB%AC%B4%EC%9C%84%EC%82%AC%EA%B7%B9%EB%9D%BD%EC%A0%84.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c9/%EA%B0%95%EC%A7%84%EB%AC%B4%EC%9C%84%EC%82%AC%EA%B7%B9%EB%9D%BD%EC%A0%84.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Unknown authorUnknown author · Public domain · WebP 변환·축소",
      "photoLicense": "Public domain",
      "photoLicenseUrl": "",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "neungsan-tombs": {
      "image": "/web/app/assets/spots/neungsan-tombs.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Tombs_in_Neungsan-ri,_Buyeo,_Korea.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/6/65/Tombs_in_Neungsan-ri%2C_Buyeo%2C_Korea.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Ryuch · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "geumdangsa": {
      "image": "/web/app/assets/spots/geumdangsa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Jinan-Geumdangsa_3669-07.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/f/f4/Korea-Jinan-Geumdangsa_3669-07.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814 · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "baekyangsa": {
      "image": "/web/app/assets/spots/baekyangsa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Baekyangsa.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Baekyangsa.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Dalgial · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "wonju-hyanggyo": {
      "image": "/web/app/assets/spots/wonju-hyanggyo.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:231226_%EC%9B%90%EC%A3%BC%ED%96%A5%EA%B5%90_%EB%82%B4%EB%B6%80.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/a/a3/231226_%EC%9B%90%EC%A3%BC%ED%96%A5%EA%B5%90_%EB%82%B4%EB%B6%80.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Aspere · CC0 · WebP 변환·축소",
      "photoLicense": "CC0",
      "photoLicenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "ssanggyesa": {
      "image": "/web/app/assets/spots/ssanggyesa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Ssanggyesa_032.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/7/71/Ssanggyesa_032.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "myself (User:Piotrus) · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "unmunsa": {
      "image": "/web/app/assets/spots/unmunsa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%9A%B4%EB%AC%B8%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/b/b6/%EC%9A%B4%EB%AC%B8%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "최옥석 · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "bulguksa": {
      "image": "/web/app/assets/spots/bulguksa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Geungnakjeon,_Bulguksa_01.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/51/Geungnakjeon%2C_Bulguksa_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Bernard Gagnon · CC0 · WebP 변환·축소",
      "photoLicense": "CC0",
      "photoLicenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "naksansa": {
      "image": "/web/app/assets/spots/naksansa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Naksansa_2215-07_grounds.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/a/a5/Korea-Naksansa_2215-07_grounds.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814 · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "sinheungsa": {
      "image": "/web/app/assets/spots/sinheungsa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Sinheungsa-Bronze_Buddha-02.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Korea-Sinheungsa-Bronze_Buddha-02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814 at English Wikipedia · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "woljeongsa": {
      "image": "/web/app/assets/spots/woljeongsa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Gangwon-Woljeongsa_Nine_Story_Pagoda_1724-07.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/51/Korea-Gangwon-Woljeongsa_Nine_Story_Pagoda_1724-07.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814 · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "ondal-park": {
      "image": "/web/app/assets/spots/ondal-park.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Danyanggun_Travel_Day2_17_(31982606110).jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/7/73/Danyanggun_Travel_Day2_17_%2831982606110%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Republic of Korea from Seoul, Republic of Korea · CC BY-SA 2.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "seosan-birdland": {
      "image": "/web/app/assets/spots/seosan-birdland.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Seosan_Bird_Land.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/52/Seosan_Bird_Land.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Seosan City Government · CC BY-SA 3.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "jangneung": {
      "image": "/web/app/assets/spots/jangneung.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:A_panoramin_view_of_Jangreung,_Yeongwol,_March_2018.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/f/f5/A_panoramin_view_of_Jangreung%2C_Yeongwol%2C_March_2018.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Jjw · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "yeongamsa-site": {
      "image": "/web/app/assets/spots/yeongamsa-site.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%ED%95%A9%EC%B2%9C_%EC%98%81%EC%95%94%EC%82%AC%EC%A7%802.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/e/e9/%ED%95%A9%EC%B2%9C_%EC%98%81%EC%95%94%EC%82%AC%EC%A7%802.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "한국학중앙연구원 · KOGL Type 1 · WebP 변환·축소",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "https://www.kogl.or.kr/info/licenseType1.do",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "hapdeok-church": {
      "image": "/web/app/assets/spots/hapdeok-church.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea_Hapdeok_Catholic_Church_19_(14217976195).jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/3/3b/Korea_Hapdeok_Catholic_Church_19_%2814217976195%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Korea.net / Korean Culture and Information Service (Photographer name) · CC BY-SA 2.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "inje-hyanggyo": {
      "image": "/web/app/assets/spots/inje-hyanggyo.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%9D%B8%EC%A0%9C%ED%96%A5%EA%B5%90.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/e/e7/%EC%9D%B8%EC%A0%9C%ED%96%A5%EA%B5%90.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "한국학중앙연구원·김지용 · KOGL Type 1 · WebP 변환·축소",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "https://www.kogl.or.kr/info/licenseType1.do",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "malisan-tombs": {
      "image": "/web/app/assets/spots/malisan-tombs.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:2024%EB%85%84_5%EC%9B%94_3%EC%9D%BC_%ED%95%A8%EC%95%88_%EB%A7%90%EC%9D%B4%EC%82%B0_%EA%B3%A0%EB%B6%84%EA%B5%B0.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/9/9d/2024%EB%85%84_5%EC%9B%94_3%EC%9D%BC_%ED%95%A8%EC%95%88_%EB%A7%90%EC%9D%B4%EC%82%B0_%EA%B3%A0%EB%B6%84%EA%B5%B0.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "NZ 토끼들 · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "borimsa": {
      "image": "/web/app/assets/spots/borimsa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%9E%A5%ED%9D%A5_%EB%B3%B4%EB%A6%BC%EC%82%AC_%EB%82%A8%C2%B7%EB%B6%81_%EC%82%BC%EC%B8%B5%EC%84%9D%ED%83%91_%EB%B0%8F_%EC%84%9D%EB%93%B1_%EB%8F%99%EC%AA%BD%EC%A0%84%EA%B2%BD_(%EC%B4%AC%EC%98%81%EB%85%84%EB%8F%84_2015%EB%85%84).jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/6/65/%EC%9E%A5%ED%9D%A5_%EB%B3%B4%EB%A6%BC%EC%82%AC_%EB%82%A8%C2%B7%EB%B6%81_%EC%82%BC%EC%B8%B5%EC%84%9D%ED%83%91_%EB%B0%8F_%EC%84%9D%EB%93%B1_%EB%8F%99%EC%AA%BD%EC%A0%84%EA%B2%BD_%28%EC%B4%AC%EC%98%81%EB%85%84%EB%8F%84_2015%EB%85%84%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Korea Heritage Service · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "uam-park": {
      "image": "/web/app/assets/spots/uam-park.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Uam_Historical_Park_01.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Uam_Historical_Park_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Exj · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    },
    "jeongamsa": {
      "image": "/web/app/assets/spots/jeongamsa.webp",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%88%98%EB%A7%88%EB%85%B8%ED%83%91.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/6/60/%EC%88%98%EB%A7%88%EB%85%B8%ED%83%91.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "배윤석 · CC BY-SA 4.0 · WebP 변환·축소",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoChanges": "WebP 변환 및 960px 이내 축소",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-04",
      "reuseStatus": "verified"
    }
  }
};
  root.SSKR_SPOT_CURATION=data;
  if(typeof module!=="undefined")module.exports=data;
})(typeof window!=="undefined"?window:globalThis);
