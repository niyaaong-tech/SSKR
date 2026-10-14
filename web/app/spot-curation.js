/* 주차 지점과 이륜차 도로 접근, 실제 장소 사진을 대조한 공용 카탈로그 보강. */
(function(root){
  const data = {
  "removedIds": [
    "abai-village",
    "allride",
    "aviation-museum",
    "baekje",
    "baekseoktan",
    "bangdong-spring",
    "bukpyeong-market",
    "bunhwangsa",
    "buryeongsa",
    "busan-maritime-museum",
    "byeongbangchi-skywalk",
    "cafe-299",
    "cafe-sann",
    "changwon-house",
    "cheonjangho",
    "daecheon-market",
    "daegwallyeong",
    "daksil",
    "damyang-market",
    "dansan",
    "danyang-market",
    "domaryeong-viewpoint",
    "donghae-market",
    "g-rider",
    "gameunsa-site",
    "gangcheonsan",
    "gangneung-market",
    "gangneung-seongyojang",
    "geumdangsa",
    "gochang-dolmen-museum",
    "gongju-market",
    "gubongsan-observatory",
    "gyeongcheondae",
    "gyeonggijeon",
    "gyeongju-gyochon",
    "haesindang-park",
    "hapcheon-film-park",
    "harleywood",
    "heonhwa",
    "hongseong-sky-tower",
    "hue-cafe-138",
    "huinnyeoul",
    "hwasodam",
    "hwasun-red-cliff",
    "hwawangsan",
    "hwayang",
    "imgo",
    "jangneung",
    "jeokbyeokgang",
    "jinju-market",
    "jukseoru",
    "junam-reservoir",
    "jusanji",
    "kim-satgat-museum",
    "maltijae",
    "mokpo-literature-museum",
    "muryangsa",
    "museom",
    "namaste",
    "neumanjang",
    "neungsan-tombs",
    "nongol",
    "okjeongho",
    "poseokjeong",
    "rc79",
    "rest-garden",
    "road-66",
    "road-runner",
    "route7",
    "royce",
    "rpm-moto",
    "sabuk-coal-village",
    "sangseonam",
    "seondol",
    "seongjusa",
    "seongryu",
    "seosan-birdland",
    "sokcho-joyang-site",
    "two-stroke",
    "uirim-forest",
    "uirim-museum",
    "uljin-market",
    "ulsan-bridge-viewpoint",
    "un-memorial-cemetery",
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
    },
    "hwaseong-fortress": {
      "lat": 37.286535400000005,
      "lng": 127.01427882572122,
      "osm": "https://www.openstreetmap.org/way/1164818521",
      "distanceToPlaceMeters": 253,
      "placeCoordinate": [
        37.2867876,
        127.0114366
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/1791243454"
    },
    "yunggeolleung": {
      "lat": 37.207558000000006,
      "lng": 126.98972332497164,
      "osm": "https://www.openstreetmap.org/way/311231801",
      "distanceToPlaceMeters": 104,
      "placeCoordinate": [
        37.208282049999994,
        126.98897959405065
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/311231812"
    },
    "silleuksa": {
      "lat": 37.29291535,
      "lng": 127.66024560757947,
      "osm": "https://www.openstreetmap.org/way/471377055",
      "distanceToPlaceMeters": 537,
      "placeCoordinate": [
        37.2976273,
        127.6615659
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/2632031838"
    },
    "seolbong-park": {
      "lat": 37.2754815,
      "lng": 127.4279328231874,
      "osm": "https://www.openstreetmap.org/way/337559192",
      "distanceToPlaceMeters": 193,
      "placeCoordinate": [
        37.2757201,
        127.42576799270593
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/337569806"
    },
    "dumulmeori": {
      "lat": 37.53419585,
      "lng": 127.31643189645725,
      "osm": "https://www.openstreetmap.org/way/584506152",
      "distanceToPlaceMeters": 347,
      "placeCoordinate": [
        37.534660450000004,
        127.31253972902519
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/832185825"
    },
    "anseong-cheongryongsa": {
      "lat": 36.912726449999994,
      "lng": 127.29134015150053,
      "osm": "https://www.openstreetmap.org/way/1356599108",
      "distanceToPlaceMeters": 251,
      "placeCoordinate": [
        36.913553699999994,
        127.2887092110604
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1282402749"
    },
    "chiljangsa": {
      "lat": 37.026104450000005,
      "lng": 127.3984496646121,
      "osm": "https://www.openstreetmap.org/way/1395618051",
      "distanceToPlaceMeters": 124,
      "placeCoordinate": [
        37.026257,
        127.39706638464365
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/821742400"
    },
    "namhansanseong": {
      "lat": 37.4768561,
      "lng": 127.18364733695186,
      "osm": "https://www.openstreetmap.org/way/872191524",
      "distanceToPlaceMeters": 399,
      "placeCoordinate": [
        37.4791368,
        127.1801588
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/2668229479"
    },
    "railroad-museum": {
      "lat": 37.3140767,
      "lng": 126.94965771189817,
      "osm": "https://www.openstreetmap.org/way/829939492",
      "distanceToPlaceMeters": 104,
      "placeCoordinate": [
        37.314017899999996,
        126.95082720956259
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/60819387"
    },
    "samsung-transport": {
      "lat": 37.3000447,
      "lng": 127.21774219079107,
      "osm": "https://www.openstreetmap.org/way/824027912",
      "distanceToPlaceMeters": 120,
      "placeCoordinate": [
        37.30110185,
        127.21747135361949
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/824027913"
    },
    "pungsuwon": {
      "lat": 37.52839205,
      "lng": 127.81742879493764,
      "osm": "https://www.openstreetmap.org/way/1055946408",
      "distanceToPlaceMeters": 146,
      "placeCoordinate": [
        37.529210500000005,
        127.81872615
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1055946406"
    },
    "sutasa": {
      "lat": 37.69770785,
      "lng": 127.95549356067193,
      "osm": "https://www.openstreetmap.org/way/1056348515",
      "distanceToPlaceMeters": 332,
      "placeCoordinate": [
        37.6984994,
        127.9591262
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/8547300068"
    },
    "parksugeun": {
      "lat": 38.097529699999996,
      "lng": 127.98527426884608,
      "osm": "https://www.openstreetmap.org/way/1190193249",
      "distanceToPlaceMeters": 142,
      "placeCoordinate": [
        38.0974539,
        127.9836522
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/7477671685"
    },
    "kimyujeong": {
      "lat": 37.81731905,
      "lng": 127.71368491046083,
      "osm": "https://www.openstreetmap.org/way/1528325575",
      "distanceToPlaceMeters": 121,
      "placeCoordinate": [
        37.817,
        127.715
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1528325575"
    },
    "daegwallyeong-sheep": {
      "lat": 37.684445249999996,
      "lng": 128.75454608014772,
      "osm": "https://www.openstreetmap.org/way/469371491",
      "distanceToPlaceMeters": 576,
      "placeCoordinate": [
        37.6895278,
        128.75329572609584
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/257727875"
    },
    "gossi-cave": {
      "lat": 37.12987035,
      "lng": 128.53507015073055,
      "osm": "https://www.openstreetmap.org/way/546658013",
      "distanceToPlaceMeters": 203,
      "placeCoordinate": [
        37.1293151,
        128.5328946
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/368662146"
    },
    "hwangji": {
      "lat": 37.174396099999996,
      "lng": 128.99241565831846,
      "osm": "https://www.openstreetmap.org/way/679364449",
      "distanceToPlaceMeters": 186,
      "placeCoordinate": [
        37.17313865,
        128.9910362865
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/676857655"
    },
    "pohang-jukdo": {
      "lat": 36.034978300000006,
      "lng": 129.3714761612852,
      "osm": "https://www.openstreetmap.org/way/471696796",
      "distanceToPlaceMeters": 335,
      "placeCoordinate": [
        36.0350097,
        129.3677505867912
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/172241993"
    },
    "guryongpo-history": {
      "lat": 35.99007,
      "lng": 129.5605689802186,
      "osm": "https://www.openstreetmap.org/way/1479639570",
      "distanceToPlaceMeters": 106,
      "placeCoordinate": [
        35.9905475,
        129.5615858
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/13572893483"
    },
    "daejeonsa": {
      "lat": 36.39060445,
      "lng": 129.1412752372145,
      "osm": "https://www.openstreetmap.org/way/671200385",
      "distanceToPlaceMeters": 790,
      "placeCoordinate": [
        36.39686665,
        129.14544048730252
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/376622632"
    },
    "seoseokji": {
      "lat": 36.611430600000006,
      "lng": 129.0694824716013,
      "osm": "https://www.openstreetmap.org/way/691141024",
      "distanceToPlaceMeters": 45,
      "placeCoordinate": [
        36.6118173,
        129.0696123
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/12763453000"
    },
    "hoeryongpo": {
      "lat": 36.57624075,
      "lng": 128.32554096431517,
      "osm": "https://www.openstreetmap.org/way/925514937",
      "distanceToPlaceMeters": 117,
      "placeCoordinate": [
        36.577202799999995,
        128.3250137911998
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/469319216"
    },
    "baekdudaegan-arboretum": {
      "lat": 37.00331095,
      "lng": 128.80147145702273,
      "osm": "https://www.openstreetmap.org/way/1225869218",
      "distanceToPlaceMeters": 850,
      "placeCoordinate": [
        37.005054599999994,
        128.8107959268902
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1055885827"
    },
    "munmu-tomb": {
      "lat": 35.739371500000004,
      "lng": 129.48359407396322,
      "osm": "https://www.openstreetmap.org/way/1510419636",
      "distanceToPlaceMeters": 327,
      "placeCoordinate": [
        35.7381286,
        129.4868756
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/1503595843"
    },
    "golgulsa": {
      "lat": 35.80633355,
      "lng": 129.41356363182058,
      "osm": "https://www.openstreetmap.org/way/376784134",
      "distanceToPlaceMeters": 744,
      "placeCoordinate": [
        35.8034058,
        129.4061416309268
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/567460087"
    },
    "beopjusa": {
      "lat": 36.5407592,
      "lng": 127.83320867457257,
      "osm": "https://www.openstreetmap.org/way/1413444632",
      "distanceToPlaceMeters": 375,
      "placeCoordinate": [
        36.543822500000005,
        127.83496625815403
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/58586419"
    },
    "bogangcheon": {
      "lat": 36.789189750000006,
      "lng": 127.57811381276812,
      "osm": "https://www.openstreetmap.org/way/1456800558",
      "distanceToPlaceMeters": 231,
      "placeCoordinate": [
        36.78711895,
        127.57834154198902
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/471368147"
    },
    "jincheon-nongdari": {
      "lat": 36.82959365,
      "lng": 127.49378143933541,
      "osm": "https://www.openstreetmap.org/way/1037384856",
      "distanceToPlaceMeters": 400,
      "placeCoordinate": [
        36.8260137,
        127.4934014
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/9560157002"
    },
    "yeongguksa": {
      "lat": 36.15759505,
      "lng": 127.62076592709178,
      "osm": "https://www.openstreetmap.org/way/1555020402",
      "distanceToPlaceMeters": 885,
      "placeCoordinate": [
        36.157980550000005,
        127.61091511591842
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1555020403"
    },
    "sanmagi": {
      "lat": 36.7605503,
      "lng": 127.83732495464135,
      "osm": "https://www.openstreetmap.org/way/1089965010",
      "distanceToPlaceMeters": 118,
      "placeCoordinate": [
        36.7596041,
        127.8367156
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/11158630159"
    },
    "uirimji": {
      "lat": 37.176128750000004,
      "lng": 128.21130133964854,
      "osm": "https://www.openstreetmap.org/way/1565320992",
      "distanceToPlaceMeters": 326,
      "placeCoordinate": [
        37.17324515,
        128.21062924206336
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/471709902"
    },
    "independence-hall": {
      "lat": 36.778852799999996,
      "lng": 127.2229026143583,
      "osm": "https://www.openstreetmap.org/way/1447618667",
      "distanceToPlaceMeters": 498,
      "placeCoordinate": [
        36.783045,
        127.224876
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/368635603"
    },
    "hyeonchungsa": {
      "lat": 36.8046287,
      "lng": 127.0297165758278,
      "osm": "https://www.openstreetmap.org/way/119129481",
      "distanceToPlaceMeters": 395,
      "placeCoordinate": [
        36.80715385,
        127.03284452609338
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/633128879"
    },
    "gwanchoksa": {
      "lat": 36.1915608,
      "lng": 127.11384355000001,
      "osm": "https://www.openstreetmap.org/way/1552760715",
      "distanceToPlaceMeters": 354,
      "placeCoordinate": [
        36.1884477,
        127.11302457258759
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/807186103"
    },
    "donam-seowon": {
      "lat": 36.211083,
      "lng": 127.18162983871196,
      "osm": "https://www.openstreetmap.org/way/1559875181",
      "distanceToPlaceMeters": 241,
      "placeCoordinate": [
        36.20909605,
        127.18054801916924
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1566967143"
    },
    "boseoksa": {
      "lat": 36.0518349,
      "lng": 127.47686922959917,
      "osm": "https://www.openstreetmap.org/way/1103331190",
      "distanceToPlaceMeters": 303,
      "placeCoordinate": [
        36.0544668,
        127.47599771520214
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1103329175"
    },
    "janggoksa": {
      "lat": 36.417137350000004,
      "lng": 126.85885545686831,
      "osm": "https://www.openstreetmap.org/way/1278348988",
      "distanceToPlaceMeters": 58,
      "placeCoordinate": [
        36.4173485,
        126.8594428
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/9777426439"
    },
    "haeinsa": {
      "lat": 35.8006189,
      "lng": 128.09837020000003,
      "osm": "https://www.openstreetmap.org/way/1512014446",
      "distanceToPlaceMeters": 56,
      "placeCoordinate": [
        35.801041600000005,
        128.09803832230688
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/404193034"
    },
    "upo-wetland": {
      "lat": 35.560789299999996,
      "lng": 128.4116484768071,
      "osm": "https://www.openstreetmap.org/way/1216364353",
      "distanceToPlaceMeters": 910,
      "placeCoordinate": [
        35.55302105,
        128.41482266764348
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/37220944"
    },
    "namhae-german-village": {
      "lat": 34.80055875,
      "lng": 128.03809248495762,
      "osm": "https://www.openstreetmap.org/way/158003436",
      "distanceToPlaceMeters": 237,
      "placeCoordinate": [
        34.7992332,
        128.0401294
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/2487576879"
    },
    "daeheungsa": {
      "lat": 34.483264500000004,
      "lng": 126.61425540610024,
      "osm": "https://www.openstreetmap.org/way/1306062724",
      "distanceToPlaceMeters": 783,
      "placeCoordinate": [
        34.4763626,
        126.61595429679214
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/616559205"
    },
    "usuyoung": {
      "lat": 34.5731116,
      "lng": 126.31004561667106,
      "osm": "https://www.openstreetmap.org/way/1347901906",
      "distanceToPlaceMeters": 296,
      "placeCoordinate": [
        34.574,
        126.307
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1347901906"
    },
    "gokseong-rail-village": {
      "lat": 35.2786906,
      "lng": 127.30669735208888,
      "osm": "https://www.openstreetmap.org/way/654986729",
      "distanceToPlaceMeters": 155,
      "placeCoordinate": [
        35.27898415,
        127.3083654754171
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/286359314"
    },
    "jeoksang-records": {
      "lat": 35.9488737,
      "lng": 127.69363988984891,
      "osm": "https://www.openstreetmap.org/way/1057231294",
      "distanceToPlaceMeters": 101,
      "placeCoordinate": [
        35.94851465,
        127.69466762090885
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1057223207"
    },
    "seonyudo": {
      "lat": 35.807431949999994,
      "lng": 126.41504387791687,
      "osm": "https://www.openstreetmap.org/way/1263145771",
      "distanceToPlaceMeters": 418,
      "placeCoordinate": [
        35.810778049999996,
        126.41715615001581
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/554668863"
    },
    "silsangsa": {
      "lat": 35.416193050000004,
      "lng": 127.6357261568551,
      "osm": "https://www.openstreetmap.org/way/1383677386",
      "distanceToPlaceMeters": 109,
      "placeCoordinate": [
        35.4170943,
        127.6352638
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/1047433245"
    },
    "maisantapsa": {
      "lat": 35.76656885,
      "lng": 127.41471137962478,
      "osm": "https://www.openstreetmap.org/way/1163244846",
      "distanceToPlaceMeters": 922,
      "placeCoordinate": [
        35.75861965,
        127.41178731264422
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/158176940"
    },
    "donghwasa": {
      "lat": 35.9925061,
      "lng": 128.70277719903316,
      "osm": "https://www.openstreetmap.org/way/814581049",
      "distanceToPlaceMeters": 175,
      "placeCoordinate": [
        35.99271315,
        128.70470542738215
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/660080732"
    },
    "jangtaesan": {
      "lat": 36.221412,
      "lng": 127.34000247345986,
      "osm": "https://www.openstreetmap.org/way/1221913111",
      "distanceToPlaceMeters": 240,
      "placeCoordinate": [
        36.219296,
        127.3394828
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/368975476"
    },
    "ulsan-taehwa": {
      "lat": 35.54475095,
      "lng": 129.29341671348703,
      "osm": "https://www.openstreetmap.org/way/827162213",
      "distanceToPlaceMeters": 189,
      "placeCoordinate": [
        35.546,
        129.292
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/827162213"
    },
    "hanhyeong-view": {
      "lat": 37.21953905,
      "lng": 128.35762550618162,
      "osm": "https://www.openstreetmap.org/way/1346322127",
      "distanceToPlaceMeters": 590,
      "placeCoordinate": [
        37.2195343,
        128.350964
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/360268669"
    },
    "dosan-seowon": {
      "lat": 36.7283167,
      "lng": 128.84020477352342,
      "osm": "https://www.openstreetmap.org/way/691122226",
      "distanceToPlaceMeters": 337,
      "placeCoordinate": [
        36.726583,
        128.8433122
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/6872626485"
    },
    "bongjeongsa": {
      "lat": 36.65099535,
      "lng": 128.6624436130282,
      "osm": "https://www.openstreetmap.org/way/1258543786",
      "distanceToPlaceMeters": 254,
      "placeCoordinate": [
        36.65326615,
        128.6627249981005
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/691112451"
    },
    "gakyeonsa": {
      "lat": 36.75473465,
      "lng": 127.92391384718412,
      "osm": "https://www.openstreetmap.org/way/1546247710",
      "distanceToPlaceMeters": 309,
      "placeCoordinate": [
        36.7547948,
        127.92737818176113
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1177176957"
    },
    "kimjwajin": {
      "lat": 36.597686800000005,
      "lng": 126.54613940856433,
      "osm": "https://www.openstreetmap.org/way/527184277",
      "distanceToPlaceMeters": 58,
      "placeCoordinate": [
        36.59751415,
        126.54675112935527
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/527184273"
    },
    "mallipo": {
      "lat": 36.7831219,
      "lng": 126.14273966833346,
      "osm": "https://www.openstreetmap.org/way/697071536",
      "distanceToPlaceMeters": 547,
      "placeCoordinate": [
        36.7879429,
        126.14398335359225
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/495225199"
    },
    "hwangtohyeon": {
      "lat": 35.63394984999999,
      "lng": 126.83042866451507,
      "osm": "https://www.openstreetmap.org/way/1353867712",
      "distanceToPlaceMeters": 222,
      "placeCoordinate": [
        35.6320978,
        126.82952013255506
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/117154054"
    },
    "imsil-cheese": {
      "lat": 35.632061300000004,
      "lng": 127.30251555782988,
      "osm": "https://www.openstreetmap.org/way/1254792645",
      "distanceToPlaceMeters": 146,
      "placeCoordinate": [
        35.633294250000006,
        127.3019645034567
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1118017057"
    },
    "namgye-seowon": {
      "lat": 35.546974250000005,
      "lng": 127.78263562790201,
      "osm": "https://www.openstreetmap.org/way/1220420601",
      "distanceToPlaceMeters": 236,
      "placeCoordinate": [
        35.54897655,
        127.78351166116272
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1166004351"
    },
    "naewonsa": {
      "lat": 35.4247221,
      "lng": 129.10557445310405,
      "osm": "https://www.openstreetmap.org/way/1242735913",
      "distanceToPlaceMeters": 120,
      "placeCoordinate": [
        35.4241303,
        129.10447153819203
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/787196426"
    },
    "hyangiram": {
      "lat": 34.5999215,
      "lng": 127.80202632862151,
      "osm": "https://www.openstreetmap.org/way/97802184",
      "distanceToPlaceMeters": 940,
      "placeCoordinate": [
        34.59159665,
        127.8038089
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1304265380"
    },
    "neunggasa": {
      "lat": 34.64055395,
      "lng": 127.4135980764863,
      "osm": "https://www.openstreetmap.org/way/1234176658",
      "distanceToPlaceMeters": 182,
      "placeCoordinate": [
        34.63901439999999,
        127.414273638515
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/640489781"
    },
    "gwangju-folk-museum": {
      "lat": 35.1835789,
      "lng": 126.88777515184293,
      "osm": "https://www.openstreetmap.org/way/468963211",
      "distanceToPlaceMeters": 103,
      "placeCoordinate": [
        35.1841681,
        126.8886428
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/368733972"
    },
    "seomun-market": {
      "lat": 35.86887895,
      "lng": 128.58072806075631,
      "osm": "https://www.openstreetmap.org/way/769505242",
      "distanceToPlaceMeters": 61,
      "placeCoordinate": [
        35.86943,
        128.5807059
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/368867948"
    },
    "jeongsan-hyanggyo": {
      "lat": 36.41647345,
      "lng": 126.94518910234564,
      "osm": "https://www.openstreetmap.org/way/1509391276",
      "distanceToPlaceMeters": 108,
      "placeCoordinate": [
        36.4160532,
        126.9441063
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/8699906982"
    },
    "korea-pop-museum": {
      "lat": 35.8397695,
      "lng": 129.29145330902531,
      "osm": "https://www.openstreetmap.org/way/1167540459",
      "distanceToPlaceMeters": 177,
      "placeCoordinate": [
        35.8399918,
        129.28951
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/node/11513252411"
    },
    "daewangam-park": {
      "lat": 35.4898321,
      "lng": 129.43621751648374,
      "osm": "https://www.openstreetmap.org/way/476518086",
      "distanceToPlaceMeters": 456,
      "placeCoordinate": [
        35.49235965,
        129.44017771027995
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/476518093"
    },
    "geological-museum": {
      "lat": 36.3755806,
      "lng": 127.36328999952002,
      "osm": "https://www.openstreetmap.org/way/1529364859",
      "distanceToPlaceMeters": 192,
      "placeCoordinate": [
        36.37730795,
        127.3631967
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/539424926"
    },
    "sejong-arboretum": {
      "lat": 36.49834045,
      "lng": 127.28283757749011,
      "osm": "https://www.openstreetmap.org/way/1113205038",
      "distanceToPlaceMeters": 427,
      "placeCoordinate": [
        36.49480835,
        127.28471657775589
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/799013764"
    },
    "sinchang-hyanggyo": {
      "lat": 36.77418925,
      "lng": 126.93293614130229,
      "osm": "https://www.openstreetmap.org/way/601189133",
      "distanceToPlaceMeters": 642,
      "placeCoordinate": [
        36.7798856,
        126.93178960193785
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/930485856"
    },
    "buan-guam-dolmens": {
      "lat": 35.7077592,
      "lng": 126.6548928752054,
      "osm": "https://www.openstreetmap.org/way/946849571",
      "distanceToPlaceMeters": 41,
      "placeCoordinate": [
        35.70793155,
        126.65448543876123
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/946849576"
    },
    "jisan-tombs": {
      "lat": 35.72223385,
      "lng": 128.25820699400066,
      "osm": "https://www.openstreetmap.org/way/1157579672",
      "distanceToPlaceMeters": 95,
      "placeCoordinate": [
        35.72247555,
        128.2592219086045
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1157609217"
    },
    "seosan-hyanggyo": {
      "lat": 36.7913834,
      "lng": 126.4570131,
      "osm": "https://www.openstreetmap.org/node/10637482734",
      "distanceToPlaceMeters": 50,
      "placeCoordinate": [
        36.791087950000005,
        126.45658544596454
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1257074855"
    },
    "dangjin-hyanggyo": {
      "lat": 36.8956603,
      "lng": 126.6322116664634,
      "osm": "https://www.openstreetmap.org/way/1210900865",
      "distanceToPlaceMeters": 357,
      "placeCoordinate": [
        36.892645599999994,
        126.63359854726009
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1306511236"
    },
    "songhak-tombs": {
      "lat": 34.9835729,
      "lng": 128.31846655168596,
      "osm": "https://www.openstreetmap.org/way/1058948750",
      "distanceToPlaceMeters": 412,
      "placeCoordinate": [
        34.98054405,
        128.32107759180252
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1308093635"
    },
    "okjeon-tombs": {
      "lat": 35.58316265,
      "lng": 128.2789180762929,
      "osm": "https://www.openstreetmap.org/way/1512562095",
      "distanceToPlaceMeters": 176,
      "placeCoordinate": [
        35.58171895,
        128.27971529155968
      ],
      "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
      "placeSource": "https://www.openstreetmap.org/way/1512560654"
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
    },
    {
      "id": "hwaseong-fortress",
      "kind": "spot",
      "category": "culture",
      "name": "수원화성",
      "region": "경기 수원",
      "lat": 37.2867876,
      "lng": 127.0114366,
      "lead": "성문과 성곽을 따라 걷는 수원의 역사",
      "description": "성곽과 성문을 가까이에서 만날 수 있는 수원의 대표 명소입니다. 긴 성곽 일주 대신 주차장 인근의 성문이나 산책 구간을 골라 둘러보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/1791243454",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.2867876,
        127.0114366
      ],
      "parking": {
        "lat": 37.286535400000005,
        "lng": 127.01427882572122,
        "osm": "https://www.openstreetmap.org/way/1164818521",
        "distanceToPlaceMeters": 253,
        "placeCoordinate": [
          37.2867876,
          127.0114366
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/1791243454"
      }
    },
    {
      "id": "yunggeolleung",
      "kind": "spot",
      "category": "culture",
      "name": "융건릉",
      "region": "경기 화성",
      "lat": 37.208282049999994,
      "lng": 126.98897959405065,
      "lead": "숲길과 잔디밭으로 이어지는 왕릉 산책",
      "description": "왕릉과 숲길을 함께 둘러볼 수 있는 곳입니다. 두 능을 모두 돌아보기보다 가까운 능역 한 곳을 골라 짧게 걸어보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/311231812",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.208282049999994,
        126.98897959405065
      ],
      "parking": {
        "lat": 37.207558000000006,
        "lng": 126.98972332497164,
        "osm": "https://www.openstreetmap.org/way/311231801",
        "distanceToPlaceMeters": 104,
        "placeCoordinate": [
          37.208282049999994,
          126.98897959405065
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/311231812"
      }
    },
    {
      "id": "silleuksa",
      "kind": "spot",
      "category": "culture",
      "name": "신륵사",
      "region": "경기 여주",
      "lat": 37.2976273,
      "lng": 127.6615659,
      "lead": "남한강변 누각과 절집을 함께 만나는 곳",
      "description": "남한강변에 자리한 여주의 절집입니다. 사찰 주변을 둘러보고 강을 바라보며 잠시 쉬어갈 수 있습니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/2632031838",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.2976273,
        127.6615659
      ],
      "parking": {
        "lat": 37.29291535,
        "lng": 127.66024560757947,
        "osm": "https://www.openstreetmap.org/way/471377055",
        "distanceToPlaceMeters": 537,
        "placeCoordinate": [
          37.2976273,
          127.6615659
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/2632031838"
      }
    },
    {
      "id": "seolbong-park",
      "kind": "spot",
      "category": "nature",
      "name": "설봉공원",
      "region": "경기 이천",
      "lat": 37.2757201,
      "lng": 127.42576799270593,
      "lead": "호수와 조각, 도자 문화가 있는 공원",
      "description": "호수와 조각 작품, 도자 문화가 어우러진 이천의 공원입니다. 호숫가의 가까운 산책 구간에서 주행 사이의 휴식을 즐겨보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/337569806",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.2757201,
        127.42576799270593
      ],
      "parking": {
        "lat": 37.2754815,
        "lng": 127.4279328231874,
        "osm": "https://www.openstreetmap.org/way/337559192",
        "distanceToPlaceMeters": 193,
        "placeCoordinate": [
          37.2757201,
          127.42576799270593
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/337569806"
      }
    },
    {
      "id": "dumulmeori",
      "kind": "spot",
      "category": "nature",
      "name": "두물머리",
      "region": "경기 양평",
      "lat": 37.534660450000004,
      "lng": 127.31253972902519,
      "lead": "남한강과 북한강이 만나는 물가 풍경",
      "description": "남한강과 북한강이 만나는 양평의 물가입니다. 강변 풍경과 오래된 나무를 바라보며 잠시 쉬어가기 좋습니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/832185825",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.534660450000004,
        127.31253972902519
      ],
      "parking": {
        "lat": 37.53419585,
        "lng": 127.31643189645725,
        "osm": "https://www.openstreetmap.org/way/584506152",
        "distanceToPlaceMeters": 347,
        "placeCoordinate": [
          37.534660450000004,
          127.31253972902519
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/832185825"
      }
    },
    {
      "id": "anseong-cheongryongsa",
      "kind": "spot",
      "category": "culture",
      "name": "청룡사",
      "region": "경기 안성",
      "lat": 36.913553699999994,
      "lng": 127.2887092110604,
      "lead": "남사당의 이야기가 남아 있는 안성의 절집",
      "description": "안성의 산자락에 자리한 오래된 절집입니다. 주차 후 가까운 전각과 주변 풍경을 둘러보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1282402749",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.913553699999994,
        127.2887092110604
      ],
      "parking": {
        "lat": 36.912726449999994,
        "lng": 127.29134015150053,
        "osm": "https://www.openstreetmap.org/way/1356599108",
        "distanceToPlaceMeters": 251,
        "placeCoordinate": [
          36.913553699999994,
          127.2887092110604
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1282402749"
      }
    },
    {
      "id": "chiljangsa",
      "kind": "spot",
      "category": "culture",
      "name": "칠장사",
      "region": "경기 안성",
      "lat": 37.026257,
      "lng": 127.39706638464365,
      "lead": "숲과 옛 건축이 어우러진 안성의 절집",
      "description": "숲과 옛 건축이 어우러진 안성의 사찰입니다. 등산 일정을 잡기보다 절집 주변을 짧게 걷는 방문에 맞춰보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/821742400",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.026257,
        127.39706638464365
      ],
      "parking": {
        "lat": 37.026104450000005,
        "lng": 127.3984496646121,
        "osm": "https://www.openstreetmap.org/way/1395618051",
        "distanceToPlaceMeters": 124,
        "placeCoordinate": [
          37.026257,
          127.39706638464365
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/821742400"
      }
    },
    {
      "id": "namhansanseong",
      "kind": "spot",
      "category": "culture",
      "name": "남한산성",
      "region": "경기 광주",
      "lat": 37.4791368,
      "lng": 127.1801588,
      "lead": "능선을 따라 남아 있는 유네스코 산성",
      "description": "능선을 따라 성곽이 이어지는 산성입니다. 전체 성곽을 돌기보다 주차장과 가까운 성문이나 마을 주변을 골라 둘러보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/2668229479",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.4791368,
        127.1801588
      ],
      "parking": {
        "lat": 37.4768561,
        "lng": 127.18364733695186,
        "osm": "https://www.openstreetmap.org/way/872191524",
        "distanceToPlaceMeters": 399,
        "placeCoordinate": [
          37.4791368,
          127.1801588
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/2668229479"
      }
    },
    {
      "id": "railroad-museum",
      "kind": "spot",
      "category": "culture",
      "name": "철도박물관",
      "region": "경기 의왕",
      "lat": 37.314017899999996,
      "lng": 126.95082720956259,
      "lead": "철도박물관에서 잠시 쉬어가는 시간.",
      "description": "철도 차량과 철도 역사를 살펴볼 수 있는 의왕의 박물관입니다. 주차 후 야외 차량 전시와 가까운 실내 전시를 중심으로 둘러보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/60819387",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.314017899999996,
        126.95082720956259
      ],
      "parking": {
        "lat": 37.3140767,
        "lng": 126.94965771189817,
        "osm": "https://www.openstreetmap.org/way/829939492",
        "distanceToPlaceMeters": 104,
        "placeCoordinate": [
          37.314017899999996,
          126.95082720956259
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/60819387"
      }
    },
    {
      "id": "samsung-transport",
      "kind": "spot",
      "category": "culture",
      "name": "삼성화재교통박물관",
      "region": "경기 용인",
      "lat": 37.30110185,
      "lng": 127.21747135361949,
      "lead": "삼성화재교통박물관에서 잠시 쉬어가는 시간.",
      "description": "용인에 있는 자동차 박물관입니다. 전시 차량과 야외 공간을 둘러보며 주행 사이에 다른 이동 수단의 역사를 만나보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/824027913",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.30110185,
        127.21747135361949
      ],
      "parking": {
        "lat": 37.3000447,
        "lng": 127.21774219079107,
        "osm": "https://www.openstreetmap.org/way/824027912",
        "distanceToPlaceMeters": 120,
        "placeCoordinate": [
          37.30110185,
          127.21747135361949
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/824027913"
      }
    },
    {
      "id": "pungsuwon",
      "kind": "spot",
      "category": "culture",
      "name": "풍수원성당",
      "region": "강원 횡성",
      "lat": 37.529210500000005,
      "lng": 127.81872615,
      "lead": "붉은 벽돌 성당과 산골 마을의 고요함",
      "description": "횡성의 산골 마을에 자리한 붉은 벽돌 성당입니다. 성당과 주변 공간을 둘러보며 차분하게 쉬어갈 수 있습니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1055946406",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.529210500000005,
        127.81872615
      ],
      "parking": {
        "lat": 37.52839205,
        "lng": 127.81742879493764,
        "osm": "https://www.openstreetmap.org/way/1055946408",
        "distanceToPlaceMeters": 146,
        "placeCoordinate": [
          37.529210500000005,
          127.81872615
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1055946406"
      }
    },
    {
      "id": "sutasa",
      "kind": "spot",
      "category": "culture",
      "name": "수타사",
      "region": "강원 홍천",
      "lat": 37.6984994,
      "lng": 127.9591262,
      "lead": "계곡을 따라 만나는 오래된 절집",
      "description": "홍천의 계곡 곁에 자리한 오래된 절집입니다. 사찰과 입구 주변을 짧게 걸으며 숲의 그늘을 즐겨보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/8547300068",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.6984994,
        127.9591262
      ],
      "parking": {
        "lat": 37.69770785,
        "lng": 127.95549356067193,
        "osm": "https://www.openstreetmap.org/way/1056348515",
        "distanceToPlaceMeters": 332,
        "placeCoordinate": [
          37.6984994,
          127.9591262
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/8547300068"
      }
    },
    {
      "id": "parksugeun",
      "kind": "spot",
      "category": "culture",
      "name": "박수근미술관",
      "region": "강원 양구",
      "lat": 38.0974539,
      "lng": 127.9836522,
      "lead": "돌담과 숲 사이에서 만나는 박수근의 그림",
      "description": "양구에서 박수근의 작품과 삶을 만나는 미술관입니다. 관심 있는 전시를 골라 둘러보고 주변 숲길에서 잠시 쉬어보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/7477671685",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        38.0974539,
        127.9836522
      ],
      "parking": {
        "lat": 38.097529699999996,
        "lng": 127.98527426884608,
        "osm": "https://www.openstreetmap.org/way/1190193249",
        "distanceToPlaceMeters": 142,
        "placeCoordinate": [
          38.0974539,
          127.9836522
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/7477671685"
      }
    },
    {
      "id": "kimyujeong",
      "kind": "spot",
      "category": "culture",
      "name": "김유정문학촌",
      "region": "강원 춘천",
      "lat": 37.817,
      "lng": 127.715,
      "lead": "소설 속 실레마을을 잠시 걸어보는 시간",
      "description": "춘천 실레마을에 있는 김유정문학촌입니다. 문학 공간과 마을의 가까운 길을 걸으며 소설 속 풍경을 만나보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://commons.wikimedia.org/wiki/File:%EA%B9%80%EC%9C%A0%EC%A0%95%EB%AC%B8%ED%95%99%EC%B4%8C.jpg",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.817,
        127.715
      ],
      "parking": {
        "lat": 37.81731905,
        "lng": 127.71368491046083,
        "osm": "https://www.openstreetmap.org/way/1528325575",
        "distanceToPlaceMeters": 121,
        "placeCoordinate": [
          37.817,
          127.715
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1528325575"
      }
    },
    {
      "id": "daegwallyeong-sheep",
      "kind": "spot",
      "category": "nature",
      "name": "대관령 양떼목장",
      "region": "강원 평창",
      "lat": 37.6895278,
      "lng": 128.75329572609584,
      "lead": "고개 위 초원에서 바라보는 대관령 풍경",
      "description": "대관령 고개 위 초원에 자리한 양떼목장입니다. 전체 산책로를 한 번에 돌기보다 관람 가능한 가까운 구간을 골라 방문하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/257727875",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.6895278,
        128.75329572609584
      ],
      "parking": {
        "lat": 37.684445249999996,
        "lng": 128.75454608014772,
        "osm": "https://www.openstreetmap.org/way/469371491",
        "distanceToPlaceMeters": 576,
        "placeCoordinate": [
          37.6895278,
          128.75329572609584
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/257727875"
      }
    },
    {
      "id": "gossi-cave",
      "kind": "spot",
      "category": "nature",
      "name": "고씨굴",
      "region": "강원 영월",
      "lat": 37.1293151,
      "lng": 128.5328946,
      "lead": "남한강변에서 만나는 석회암 동굴",
      "description": "남한강변에서 만나는 영월의 석회암 동굴입니다. 관람 시간과 입장 조건을 확인하고, 동굴 방문이 어렵다면 강변에서 잠시 쉬어갈 수 있습니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/368662146",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.1293151,
        128.5328946
      ],
      "parking": {
        "lat": 37.12987035,
        "lng": 128.53507015073055,
        "osm": "https://www.openstreetmap.org/way/546658013",
        "distanceToPlaceMeters": 203,
        "placeCoordinate": [
          37.1293151,
          128.5328946
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/368662146"
      }
    },
    {
      "id": "hwangji",
      "kind": "spot",
      "category": "nature",
      "name": "황지연못",
      "region": "강원 태백",
      "lat": 37.17313865,
      "lng": 128.9910362865,
      "lead": "낙동강의 시작을 만나는 도심 속 연못",
      "description": "태백 시가지에 자리한 황지연못입니다. 연못 주변의 짧은 산책길에서 주행 사이에 숨을 고르기 좋습니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/676857655",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.17313865,
        128.9910362865
      ],
      "parking": {
        "lat": 37.174396099999996,
        "lng": 128.99241565831846,
        "osm": "https://www.openstreetmap.org/way/679364449",
        "distanceToPlaceMeters": 186,
        "placeCoordinate": [
          37.17313865,
          128.9910362865
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/676857655"
      }
    },
    {
      "id": "pohang-jukdo",
      "kind": "spot",
      "category": "food",
      "name": "포항 죽도시장",
      "region": "경북 포항",
      "lat": 36.0350097,
      "lng": 129.3677505867912,
      "lead": "동해의 제철 먹거리를 고르는 큰 장터",
      "description": "포항을 대표하는 큰 장터입니다. 지정 주차 구역에 바이크를 두고 가까운 시장 골목에서 식사와 휴식을 함께 챙겨보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/172241993",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.0350097,
        129.3677505867912
      ],
      "parking": {
        "lat": 36.034978300000006,
        "lng": 129.3714761612852,
        "osm": "https://www.openstreetmap.org/way/471696796",
        "distanceToPlaceMeters": 335,
        "placeCoordinate": [
          36.0350097,
          129.3677505867912
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/172241993"
      }
    },
    {
      "id": "guryongpo-history",
      "kind": "spot",
      "category": "culture",
      "name": "구룡포 근대역사거리",
      "region": "경북 포항",
      "lat": 35.9905475,
      "lng": 129.5615858,
      "lead": "항구 뒤편 골목에 남은 근대의 풍경",
      "description": "구룡포 항구 뒤편에 근대 건축과 골목이 남아 있는 거리입니다. 가까운 골목을 걸으며 항구와 마을의 풍경을 함께 둘러보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/13572893483",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.9905475,
        129.5615858
      ],
      "parking": {
        "lat": 35.99007,
        "lng": 129.5605689802186,
        "osm": "https://www.openstreetmap.org/way/1479639570",
        "distanceToPlaceMeters": 106,
        "placeCoordinate": [
          35.9905475,
          129.5615858
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/13572893483"
      }
    },
    {
      "id": "daejeonsa",
      "kind": "spot",
      "category": "culture",
      "name": "대전사",
      "region": "경북 청송",
      "lat": 36.39686665,
      "lng": 129.14544048730252,
      "lead": "주왕산 바위 봉우리를 마주하는 절집",
      "description": "주왕산의 바위 봉우리를 마주하는 청송의 절집입니다. 산행 대신 사찰 주변의 짧은 관람 동선을 골라 방문하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/376622632",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.39686665,
        129.14544048730252
      ],
      "parking": {
        "lat": 36.39060445,
        "lng": 129.1412752372145,
        "osm": "https://www.openstreetmap.org/way/671200385",
        "distanceToPlaceMeters": 790,
        "placeCoordinate": [
          36.39686665,
          129.14544048730252
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/376622632"
      }
    },
    {
      "id": "seoseokji",
      "kind": "spot",
      "category": "culture",
      "name": "서석지",
      "region": "경북 영양",
      "lat": 36.6118173,
      "lng": 129.0696123,
      "lead": "연못과 누각으로 이루어진 작은 옛 정원",
      "description": "연못과 누각이 어우러진 영양의 옛 정원입니다. 작은 정원의 풍경을 차분하게 둘러보는 정차 지점입니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/12763453000",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.6118173,
        129.0696123
      ],
      "parking": {
        "lat": 36.611430600000006,
        "lng": 129.0694824716013,
        "osm": "https://www.openstreetmap.org/way/691141024",
        "distanceToPlaceMeters": 45,
        "placeCoordinate": [
          36.6118173,
          129.0696123
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/12763453000"
      }
    },
    {
      "id": "baekdudaegan-arboretum",
      "kind": "spot",
      "category": "culture",
      "name": "국립백두대간수목원",
      "region": "경북 봉화",
      "lat": 37.005054599999994,
      "lng": 128.8107959268902,
      "lead": "백두대간 숲자락에 펼쳐진 정원",
      "description": "백두대간 숲자락에 넓게 펼쳐진 봉화의 수목원입니다. 전체 구역을 둘러보기보다 입구와 가까운 정원이나 전시를 골라 방문하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1055885827",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.005054599999994,
        128.8107959268902
      ],
      "parking": {
        "lat": 37.00331095,
        "lng": 128.80147145702273,
        "osm": "https://www.openstreetmap.org/way/1225869218",
        "distanceToPlaceMeters": 850,
        "placeCoordinate": [
          37.005054599999994,
          128.8107959268902
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1055885827"
      }
    },
    {
      "id": "munmu-tomb",
      "kind": "spot",
      "category": "nature",
      "name": "문무대왕릉",
      "region": "경북 경주",
      "lat": 35.7381286,
      "lng": 129.4868756,
      "lead": "신라의 바다를 바라보는 해변 정차",
      "description": "경주 해변에서 문무대왕릉을 바라볼 수 있는 곳입니다. 바닷속 바위로 들어가지 않고 해변의 관람 지점에서 풍경을 감상하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/1503595843",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.7381286,
        129.4868756
      ],
      "parking": {
        "lat": 35.739371500000004,
        "lng": 129.48359407396322,
        "osm": "https://www.openstreetmap.org/way/1510419636",
        "distanceToPlaceMeters": 327,
        "placeCoordinate": [
          35.7381286,
          129.4868756
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/1503595843"
      }
    },
    {
      "id": "golgulsa",
      "kind": "spot",
      "category": "culture",
      "name": "골굴사",
      "region": "경북 경주",
      "lat": 35.8034058,
      "lng": 129.4061416309268,
      "lead": "바위에 새긴 불상과 산자락의 절집",
      "description": "바위에 새긴 불상과 절집을 만나는 경주의 사찰입니다. 경사진 관람 구간의 상태를 확인하고 가까운 공간부터 둘러보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/567460087",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.8034058,
        129.4061416309268
      ],
      "parking": {
        "lat": 35.80633355,
        "lng": 129.41356363182058,
        "osm": "https://www.openstreetmap.org/way/376784134",
        "distanceToPlaceMeters": 744,
        "placeCoordinate": [
          35.8034058,
          129.4061416309268
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/567460087"
      }
    },
    {
      "id": "beopjusa",
      "kind": "spot",
      "category": "culture",
      "name": "법주사",
      "region": "충북 보은",
      "lat": 36.543822500000005,
      "lng": 127.83496625815403,
      "lead": "속리산 자락에서 만나는 큰 절집",
      "description": "속리산 자락에 자리한 큰 절집입니다. 긴 산행을 계획하기보다 사찰의 가까운 전각을 중심으로 방문해 보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/58586419",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.543822500000005,
        127.83496625815403
      ],
      "parking": {
        "lat": 36.5407592,
        "lng": 127.83320867457257,
        "osm": "https://www.openstreetmap.org/way/1413444632",
        "distanceToPlaceMeters": 375,
        "placeCoordinate": [
          36.543822500000005,
          127.83496625815403
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/58586419"
      }
    },
    {
      "id": "bogangcheon",
      "kind": "spot",
      "category": "nature",
      "name": "보강천 미루나무숲",
      "region": "충북 증평",
      "lat": 36.78711895,
      "lng": 127.57834154198902,
      "lead": "미루나무 그늘 아래 쉬어 가는 강변 숲",
      "description": "증평 보강천을 따라 미루나무 그늘이 이어지는 숲입니다. 강변의 가까운 길을 걸으며 잠시 쉬어가기 좋습니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/471368147",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.78711895,
        127.57834154198902
      ],
      "parking": {
        "lat": 36.789189750000006,
        "lng": 127.57811381276812,
        "osm": "https://www.openstreetmap.org/way/1456800558",
        "distanceToPlaceMeters": 231,
        "placeCoordinate": [
          36.78711895,
          127.57834154198902
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/471368147"
      }
    },
    {
      "id": "jincheon-nongdari",
      "kind": "spot",
      "category": "culture",
      "name": "진천 농다리",
      "region": "충북 진천",
      "lat": 36.8260137,
      "lng": 127.4934014,
      "lead": "물길을 건너는 오래된 돌다리",
      "description": "진천의 물길을 가로지르는 오래된 돌다리입니다. 주차 후 다리 주변을 둘러보고, 수위와 현장 통제에 따라 관람 동선을 정하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/9560157002",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.8260137,
        127.4934014
      ],
      "parking": {
        "lat": 36.82959365,
        "lng": 127.49378143933541,
        "osm": "https://www.openstreetmap.org/way/1037384856",
        "distanceToPlaceMeters": 400,
        "placeCoordinate": [
          36.8260137,
          127.4934014
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/9560157002"
      }
    },
    {
      "id": "yeongguksa",
      "kind": "spot",
      "category": "culture",
      "name": "영국사",
      "region": "충북 영동",
      "lat": 36.157980550000005,
      "lng": 127.61091511591842,
      "lead": "천태산 아래 은행나무와 오래된 절집",
      "description": "천태산 아래 은행나무와 절집이 함께 자리한 영동의 사찰입니다. 산행 대신 사찰 주변을 짧게 둘러보는 일정에 맞춰보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1555020403",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.157980550000005,
        127.61091511591842
      ],
      "parking": {
        "lat": 36.15759505,
        "lng": 127.62076592709178,
        "osm": "https://www.openstreetmap.org/way/1555020402",
        "distanceToPlaceMeters": 885,
        "placeCoordinate": [
          36.157980550000005,
          127.61091511591842
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1555020403"
      }
    },
    {
      "id": "uirimji",
      "kind": "spot",
      "category": "nature",
      "name": "의림지",
      "region": "충북 제천",
      "lat": 37.17324515,
      "lng": 128.21062924206336,
      "lead": "제천의 오래된 저수지와 소나무 그늘",
      "description": "제천의 오래된 저수지와 소나무 그늘을 만나는 곳입니다. 물가의 가까운 산책 구간에서 풍경을 감상하며 쉬어보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/471709902",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.17324515,
        128.21062924206336
      ],
      "parking": {
        "lat": 37.176128750000004,
        "lng": 128.21130133964854,
        "osm": "https://www.openstreetmap.org/way/1565320992",
        "distanceToPlaceMeters": 326,
        "placeCoordinate": [
          37.17324515,
          128.21062924206336
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/471709902"
      }
    },
    {
      "id": "independence-hall",
      "kind": "spot",
      "category": "culture",
      "name": "독립기념관",
      "region": "충남 천안",
      "lat": 36.783045,
      "lng": 127.224876,
      "lead": "독립의 역사를 마주하는 넓은 기념관",
      "description": "독립의 역사를 돌아보는 천안의 기념관입니다. 넓은 전체 구역보다 관심 있는 전시관 한 곳을 골라 관람하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/368635603",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.783045,
        127.224876
      ],
      "parking": {
        "lat": 36.778852799999996,
        "lng": 127.2229026143583,
        "osm": "https://www.openstreetmap.org/way/1447618667",
        "distanceToPlaceMeters": 498,
        "placeCoordinate": [
          36.783045,
          127.224876
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/368635603"
      }
    },
    {
      "id": "hyeonchungsa",
      "kind": "spot",
      "category": "culture",
      "name": "현충사",
      "region": "충남 아산",
      "lat": 36.80715385,
      "lng": 127.03284452609338,
      "lead": "숲길과 사당에서 기리는 이순신의 삶",
      "description": "아산에서 이순신의 삶을 기리는 사당입니다. 가까운 관람 구역과 숲길을 차분하게 둘러보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/633128879",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.80715385,
        127.03284452609338
      ],
      "parking": {
        "lat": 36.8046287,
        "lng": 127.0297165758278,
        "osm": "https://www.openstreetmap.org/way/119129481",
        "distanceToPlaceMeters": 395,
        "placeCoordinate": [
          36.80715385,
          127.03284452609338
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/633128879"
      }
    },
    {
      "id": "gwanchoksa",
      "kind": "spot",
      "category": "culture",
      "name": "관촉사",
      "region": "충남 논산",
      "lat": 36.1884477,
      "lng": 127.11302457258759,
      "lead": "큰 석불을 마주하는 논산의 절집",
      "description": "큰 석불이 자리한 논산의 절집입니다. 주차 후 가까운 관람 지점을 중심으로 사찰과 석불의 모습을 살펴보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/807186103",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.1884477,
        127.11302457258759
      ],
      "parking": {
        "lat": 36.1915608,
        "lng": 127.11384355000001,
        "osm": "https://www.openstreetmap.org/way/1552760715",
        "distanceToPlaceMeters": 354,
        "placeCoordinate": [
          36.1884477,
          127.11302457258759
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/807186103"
      }
    },
    {
      "id": "donam-seowon",
      "kind": "spot",
      "category": "culture",
      "name": "돈암서원",
      "region": "충남 논산",
      "lat": 36.20909605,
      "lng": 127.18054801916924,
      "lead": "논산 들녘에 자리한 유네스코 서원",
      "description": "논산 들녘에 자리한 서원입니다. 담장과 옛 건축을 둘러보며 지역의 풍경 속에서 짧게 쉬어갈 수 있습니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1566967143",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.20909605,
        127.18054801916924
      ],
      "parking": {
        "lat": 36.211083,
        "lng": 127.18162983871196,
        "osm": "https://www.openstreetmap.org/way/1559875181",
        "distanceToPlaceMeters": 241,
        "placeCoordinate": [
          36.20909605,
          127.18054801916924
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1566967143"
      }
    },
    {
      "id": "boseoksa",
      "kind": "spot",
      "category": "culture",
      "name": "보석사",
      "region": "충남 금산",
      "lat": 36.0544668,
      "lng": 127.47599771520214,
      "lead": "은행나무와 숲길이 있는 금산의 절집",
      "description": "큰 은행나무와 숲이 어우러진 금산의 절집입니다. 사찰과 입구 주변의 가까운 길을 걸어보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1103329175",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.0544668,
        127.47599771520214
      ],
      "parking": {
        "lat": 36.0518349,
        "lng": 127.47686922959917,
        "osm": "https://www.openstreetmap.org/way/1103331190",
        "distanceToPlaceMeters": 303,
        "placeCoordinate": [
          36.0544668,
          127.47599771520214
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1103329175"
      }
    },
    {
      "id": "janggoksa",
      "kind": "spot",
      "category": "culture",
      "name": "장곡사",
      "region": "충남 청양",
      "lat": 36.4173485,
      "lng": 126.8594428,
      "lead": "칠갑산 자락에 남은 오래된 목조건축",
      "description": "칠갑산 자락에 오래된 목조건축이 남아 있는 사찰입니다. 등산로 대신 절집 주변의 관람 구역을 골라 방문하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/9777426439",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.4173485,
        126.8594428
      ],
      "parking": {
        "lat": 36.417137350000004,
        "lng": 126.85885545686831,
        "osm": "https://www.openstreetmap.org/way/1278348988",
        "distanceToPlaceMeters": 58,
        "placeCoordinate": [
          36.4173485,
          126.8594428
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/9777426439"
      }
    },
    {
      "id": "haeinsa",
      "kind": "spot",
      "category": "culture",
      "name": "해인사",
      "region": "경남 합천",
      "lat": 35.801041600000005,
      "lng": 128.09803832230688,
      "lead": "가야산 숲자락에서 만나는 팔만대장경의 절집",
      "description": "가야산 숲자락에 자리한 해인사입니다. 사찰의 가까운 관람 구역을 중심으로 둘러보고, 장경판전 관람은 현장 운영 조건을 확인하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/404193034",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.801041600000005,
        128.09803832230688
      ],
      "parking": {
        "lat": 35.8006189,
        "lng": 128.09837020000003,
        "osm": "https://www.openstreetmap.org/way/1512014446",
        "distanceToPlaceMeters": 56,
        "placeCoordinate": [
          35.801041600000005,
          128.09803832230688
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/404193034"
      }
    },
    {
      "id": "namhae-german-village",
      "kind": "spot",
      "category": "culture",
      "name": "남해 독일마을",
      "region": "경남 남해",
      "lat": 34.7992332,
      "lng": 128.0401294,
      "lead": "붉은 지붕 너머로 펼쳐지는 남해 바다",
      "description": "붉은 지붕 너머로 남해 바다가 펼쳐지는 마을입니다. 마을의 가까운 골목과 전망 공간을 걸으며 쉬어보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/2487576879",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        34.7992332,
        128.0401294
      ],
      "parking": {
        "lat": 34.80055875,
        "lng": 128.03809248495762,
        "osm": "https://www.openstreetmap.org/way/158003436",
        "distanceToPlaceMeters": 237,
        "placeCoordinate": [
          34.7992332,
          128.0401294
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/2487576879"
      }
    },
    {
      "id": "daeheungsa",
      "kind": "spot",
      "category": "culture",
      "name": "대흥사",
      "region": "전남 해남",
      "lat": 34.4763626,
      "lng": 126.61595429679214,
      "lead": "두륜산 숲길 끝에서 만나는 유네스코 절집",
      "description": "두륜산 숲길 안쪽에 자리한 해남의 절집입니다. 산행을 따로 계획하지 않았다면 사찰 주변의 짧은 동선으로 둘러보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/616559205",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        34.4763626,
        126.61595429679214
      ],
      "parking": {
        "lat": 34.483264500000004,
        "lng": 126.61425540610024,
        "osm": "https://www.openstreetmap.org/way/1306062724",
        "distanceToPlaceMeters": 783,
        "placeCoordinate": [
          34.4763626,
          126.61595429679214
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/616559205"
      }
    },
    {
      "id": "usuyoung",
      "kind": "spot",
      "category": "culture",
      "name": "우수영관광지",
      "region": "전남 해남",
      "lat": 34.574,
      "lng": 126.307,
      "lead": "명량해전의 현장과 울돌목 물길",
      "description": "해남 우수영에서 울돌목의 물길과 명량해전의 이야기를 만나는 곳입니다. 가까운 전망 공간에서 바다의 흐름을 바라보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://commons.wikimedia.org/wiki/File:Haenam_Where_nature_meets_history,_culture.jpg",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        34.574,
        126.307
      ],
      "parking": {
        "lat": 34.5731116,
        "lng": 126.31004561667106,
        "osm": "https://www.openstreetmap.org/way/1347901906",
        "distanceToPlaceMeters": 296,
        "placeCoordinate": [
          34.574,
          126.307
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1347901906"
      }
    },
    {
      "id": "gokseong-rail-village",
      "kind": "spot",
      "category": "culture",
      "name": "섬진강기차마을",
      "region": "전남 곡성",
      "lat": 35.27898415,
      "lng": 127.3083654754171,
      "lead": "옛 철도와 정원이 함께 있는 곡성의 산책",
      "description": "옛 철도와 정원이 함께 있는 곡성의 기차마을입니다. 운행 프로그램을 기다리기보다 가까운 전시와 정원을 골라 짧게 둘러볼 수 있습니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/286359314",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.27898415,
        127.3083654754171
      ],
      "parking": {
        "lat": 35.2786906,
        "lng": 127.30669735208888,
        "osm": "https://www.openstreetmap.org/way/654986729",
        "distanceToPlaceMeters": 155,
        "placeCoordinate": [
          35.27898415,
          127.3083654754171
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/286359314"
      }
    },
    {
      "id": "jeoksang-records",
      "kind": "spot",
      "category": "culture",
      "name": "적상산성 사고지",
      "region": "전북 무주",
      "lat": 35.94851465,
      "lng": 127.69466762090885,
      "lead": "산성의 돌담과 조선의 기록을 만나는 산길.",
      "description": "적상산성의 돌담과 사고지를 만나는 산길의 정차 지점입니다. 주차 후 가까운 유적 구역을 둘러보고, 긴 산행은 별도 일정으로 계획하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1057223207",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.94851465,
        127.69466762090885
      ],
      "parking": {
        "lat": 35.9488737,
        "lng": 127.69363988984891,
        "osm": "https://www.openstreetmap.org/way/1057231294",
        "distanceToPlaceMeters": 101,
        "placeCoordinate": [
          35.94851465,
          127.69466762090885
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1057223207"
      }
    },
    {
      "id": "seonyudo",
      "kind": "spot",
      "category": "nature",
      "name": "선유도",
      "region": "전북 군산",
      "lat": 35.810778049999996,
      "lng": 126.41715615001581,
      "lead": "다리를 건너 만나는 고군산군도의 바다",
      "description": "다리로 이어진 고군산군도의 바다를 만나는 섬입니다. 지정 주차 구역에 바이크를 두고 가까운 해변과 마을 풍경을 감상하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/554668863",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.810778049999996,
        126.41715615001581
      ],
      "parking": {
        "lat": 35.807431949999994,
        "lng": 126.41504387791687,
        "osm": "https://www.openstreetmap.org/way/1263145771",
        "distanceToPlaceMeters": 418,
        "placeCoordinate": [
          35.810778049999996,
          126.41715615001581
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/554668863"
      }
    },
    {
      "id": "silsangsa",
      "kind": "spot",
      "category": "culture",
      "name": "실상사",
      "region": "전북 남원",
      "lat": 35.4170943,
      "lng": 127.6352638,
      "lead": "지리산 아래 들판에 자리한 천년고찰",
      "description": "지리산 아래 들판에 자리한 남원의 오래된 절집입니다. 산을 오르기보다 사찰 주변을 차분하게 둘러보는 일정에 어울립니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/1047433245",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.4170943,
        127.6352638
      ],
      "parking": {
        "lat": 35.416193050000004,
        "lng": 127.6357261568551,
        "osm": "https://www.openstreetmap.org/way/1383677386",
        "distanceToPlaceMeters": 109,
        "placeCoordinate": [
          35.4170943,
          127.6352638
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/1047433245"
      }
    },
    {
      "id": "maisantapsa",
      "kind": "spot",
      "category": "culture",
      "name": "마이산 탑사",
      "region": "전북 진안",
      "lat": 35.75861965,
      "lng": 127.41178731264422,
      "lead": "두 봉우리와 돌탑이 이루는 독특한 풍경",
      "description": "마이산 두 봉우리 아래 돌탑이 모여 있는 사찰입니다. 주차 후 탑사까지 걸어가는 시간을 포함해 방문 일정을 잡아보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/158176940",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.75861965,
        127.41178731264422
      ],
      "parking": {
        "lat": 35.76656885,
        "lng": 127.41471137962478,
        "osm": "https://www.openstreetmap.org/way/1163244846",
        "distanceToPlaceMeters": 922,
        "placeCoordinate": [
          35.75861965,
          127.41178731264422
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/158176940"
      }
    },
    {
      "id": "donghwasa",
      "kind": "spot",
      "category": "culture",
      "name": "동화사",
      "region": "대구 동구",
      "lat": 35.99271315,
      "lng": 128.70470542738215,
      "lead": "팔공산 숲자락에서 만나는 큰 절집",
      "description": "팔공산 숲자락에 자리한 대구의 큰 절집입니다. 가까운 관람 구역을 골라 사찰과 주변 풍경을 둘러보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/660080732",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.99271315,
        128.70470542738215
      ],
      "parking": {
        "lat": 35.9925061,
        "lng": 128.70277719903316,
        "osm": "https://www.openstreetmap.org/way/814581049",
        "distanceToPlaceMeters": 175,
        "placeCoordinate": [
          35.99271315,
          128.70470542738215
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/660080732"
      }
    },
    {
      "id": "jangtaesan",
      "kind": "spot",
      "category": "nature",
      "name": "장태산자연휴양림",
      "region": "대전 서구",
      "lat": 36.219296,
      "lng": 127.3394828,
      "lead": "메타세쿼이아가 이루는 대전의 숲길",
      "description": "메타세쿼이아 숲이 이어지는 대전의 자연휴양림입니다. 입구와 가까운 숲길에서 산행 없이도 잠시 쉬어갈 수 있습니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/368975476",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.219296,
        127.3394828
      ],
      "parking": {
        "lat": 36.221412,
        "lng": 127.34000247345986,
        "osm": "https://www.openstreetmap.org/way/1221913111",
        "distanceToPlaceMeters": 240,
        "placeCoordinate": [
          36.219296,
          127.3394828
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/368975476"
      }
    },
    {
      "id": "ulsan-taehwa",
      "kind": "spot",
      "category": "nature",
      "name": "태화강국가정원",
      "region": "울산 중구",
      "lat": 35.546,
      "lng": 129.292,
      "lead": "대숲과 강변 정원이 이어지는 울산의 산책",
      "description": "대숲과 강변 정원이 이어지는 울산의 산책 공간입니다. 가까운 정원 구간을 골라 걷고 강을 바라보며 쉬어보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://commons.wikimedia.org/wiki/File:Taehwagang_National_Garden_20221125_075.jpg",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.546,
        129.292
      ],
      "parking": {
        "lat": 35.54475095,
        "lng": 129.29341671348703,
        "osm": "https://www.openstreetmap.org/way/827162213",
        "distanceToPlaceMeters": 189,
        "placeCoordinate": [
          35.546,
          129.292
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/827162213"
      }
    },
    {
      "id": "hanhyeong-view",
      "kind": "spot",
      "category": "nature",
      "name": "한반도지형 전망대",
      "region": "강원 영월",
      "lat": 37.2195343,
      "lng": 128.350964,
      "lead": "물길이 만든 한반도 모양의 풍경",
      "description": "영월의 물길이 만든 한반도 모양의 풍경을 바라보는 전망대입니다. 주차 후 전망 지점까지 걷는 시간을 포함해 방문을 계획하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/360268669",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        37.2195343,
        128.350964
      ],
      "parking": {
        "lat": 37.21953905,
        "lng": 128.35762550618162,
        "osm": "https://www.openstreetmap.org/way/1346322127",
        "distanceToPlaceMeters": 590,
        "placeCoordinate": [
          37.2195343,
          128.350964
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/360268669"
      }
    },
    {
      "id": "dosan-seowon",
      "kind": "spot",
      "category": "culture",
      "name": "도산서원",
      "region": "경북 안동",
      "lat": 36.726583,
      "lng": 128.8433122,
      "lead": "퇴계의 배움과 낙동강 풍경이 남은 서원",
      "description": "퇴계의 배움과 낙동강 풍경이 남아 있는 안동의 서원입니다. 서원의 건축과 주변 물가를 차분하게 둘러보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/6872626485",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.726583,
        128.8433122
      ],
      "parking": {
        "lat": 36.7283167,
        "lng": 128.84020477352342,
        "osm": "https://www.openstreetmap.org/way/691122226",
        "distanceToPlaceMeters": 337,
        "placeCoordinate": [
          36.726583,
          128.8433122
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/6872626485"
      }
    },
    {
      "id": "bongjeongsa",
      "kind": "spot",
      "category": "culture",
      "name": "봉정사",
      "region": "경북 안동",
      "lat": 36.65326615,
      "lng": 128.6627249981005,
      "lead": "산자락에서 만나는 오래된 목조건축",
      "description": "안동의 산자락에 오래된 목조건축이 남아 있는 사찰입니다. 주차 후 가까운 전각부터 골라 관람하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/691112451",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.65326615,
        128.6627249981005
      ],
      "parking": {
        "lat": 36.65099535,
        "lng": 128.6624436130282,
        "osm": "https://www.openstreetmap.org/way/1258543786",
        "distanceToPlaceMeters": 254,
        "placeCoordinate": [
          36.65326615,
          128.6627249981005
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/691112451"
      }
    },
    {
      "id": "gakyeonsa",
      "kind": "spot",
      "category": "culture",
      "name": "각연사",
      "region": "충북 괴산",
      "lat": 36.7547948,
      "lng": 127.92737818176113,
      "lead": "숲길을 달려 만나는 괴산의 절집",
      "description": "괴산의 숲길 안쪽에 자리한 절집입니다. 산행 대신 사찰 주변의 관람 구역에서 잠시 쉬어갈 수 있습니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1177176957",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.7547948,
        127.92737818176113
      ],
      "parking": {
        "lat": 36.75473465,
        "lng": 127.92391384718412,
        "osm": "https://www.openstreetmap.org/way/1546247710",
        "distanceToPlaceMeters": 309,
        "placeCoordinate": [
          36.7547948,
          127.92737818176113
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1177176957"
      }
    },
    {
      "id": "kimjwajin",
      "kind": "spot",
      "category": "culture",
      "name": "김좌진장군생가지",
      "region": "충남 홍성",
      "lat": 36.59751415,
      "lng": 126.54675112935527,
      "lead": "홍성의 마을에서 돌아보는 독립운동의 역사",
      "description": "홍성의 마을에서 김좌진 장군의 삶을 돌아보는 공간입니다. 가까운 기념 공간을 둘러보며 주행 사이에 짧게 머물러보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/527184273",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.59751415,
        126.54675112935527
      ],
      "parking": {
        "lat": 36.597686800000005,
        "lng": 126.54613940856433,
        "osm": "https://www.openstreetmap.org/way/527184277",
        "distanceToPlaceMeters": 58,
        "placeCoordinate": [
          36.59751415,
          126.54675112935527
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/527184273"
      }
    },
    {
      "id": "mallipo",
      "kind": "spot",
      "category": "nature",
      "name": "만리포해수욕장",
      "region": "충남 태안",
      "lat": 36.7879429,
      "lng": 126.14398335359225,
      "lead": "서핑과 모래밭, 태안의 넓은 바다",
      "description": "태안의 넓은 모래밭과 서해를 만나는 해수욕장입니다. 지정 주차 구역에 바이크를 두고 가까운 해변에서 쉬어보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/495225199",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.7879429,
        126.14398335359225
      ],
      "parking": {
        "lat": 36.7831219,
        "lng": 126.14273966833346,
        "osm": "https://www.openstreetmap.org/way/697071536",
        "distanceToPlaceMeters": 547,
        "placeCoordinate": [
          36.7879429,
          126.14398335359225
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/495225199"
      }
    },
    {
      "id": "hwangtohyeon",
      "kind": "spot",
      "category": "culture",
      "name": "황토현전적지",
      "region": "전북 정읍",
      "lat": 35.6320978,
      "lng": 126.82952013255506,
      "lead": "동학농민혁명의 현장을 걷는 역사 공원",
      "description": "동학농민혁명의 현장을 돌아보는 정읍의 역사 공간입니다. 가까운 기념 공간과 산책 구간을 골라 방문하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/117154054",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.6320978,
        126.82952013255506
      ],
      "parking": {
        "lat": 35.63394984999999,
        "lng": 126.83042866451507,
        "osm": "https://www.openstreetmap.org/way/1353867712",
        "distanceToPlaceMeters": 222,
        "placeCoordinate": [
          35.6320978,
          126.82952013255506
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/117154054"
      }
    },
    {
      "id": "imsil-cheese",
      "kind": "spot",
      "category": "culture",
      "name": "임실치즈테마파크",
      "region": "전북 임실",
      "lat": 35.633294250000006,
      "lng": 127.3019645034567,
      "lead": "임실의 치즈와 정원을 둘러보는 정차",
      "description": "치즈와 정원을 함께 만나는 임실의 테마파크입니다. 이용 가능한 가까운 전시·정원 구역을 골라 둘러보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1118017057",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.633294250000006,
        127.3019645034567
      ],
      "parking": {
        "lat": 35.632061300000004,
        "lng": 127.30251555782988,
        "osm": "https://www.openstreetmap.org/way/1254792645",
        "distanceToPlaceMeters": 146,
        "placeCoordinate": [
          35.633294250000006,
          127.3019645034567
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1118017057"
      }
    },
    {
      "id": "namgye-seowon",
      "kind": "spot",
      "category": "culture",
      "name": "남계서원",
      "region": "경남 함양",
      "lat": 35.54897655,
      "lng": 127.78351166116272,
      "lead": "들녘과 함께 남아 있는 유네스코 서원",
      "description": "함양의 들녘에 자리한 서원입니다. 옛 건축과 주변 풍경을 차분하게 둘러보는 정차 지점입니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1166004351",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.54897655,
        127.78351166116272
      ],
      "parking": {
        "lat": 35.546974250000005,
        "lng": 127.78263562790201,
        "osm": "https://www.openstreetmap.org/way/1220420601",
        "distanceToPlaceMeters": 236,
        "placeCoordinate": [
          35.54897655,
          127.78351166116272
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1166004351"
      }
    },
    {
      "id": "naewonsa",
      "kind": "spot",
      "category": "culture",
      "name": "내원사",
      "region": "경남 양산",
      "lat": 35.4241303,
      "lng": 129.10447153819203,
      "lead": "계곡과 숲이 어우러진 양산의 절집",
      "description": "계곡과 숲이 어우러진 양산의 사찰입니다. 긴 계곡 탐방 대신 사찰과 가까운 관람 구역을 중심으로 방문하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/787196426",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.4241303,
        129.10447153819203
      ],
      "parking": {
        "lat": 35.4247221,
        "lng": 129.10557445310405,
        "osm": "https://www.openstreetmap.org/way/1242735913",
        "distanceToPlaceMeters": 120,
        "placeCoordinate": [
          35.4241303,
          129.10447153819203
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/787196426"
      }
    },
    {
      "id": "hyangiram",
      "kind": "spot",
      "category": "culture",
      "name": "향일암",
      "region": "전남 여수",
      "lat": 34.59159665,
      "lng": 127.8038089,
      "lead": "바위와 바다를 마주하는 여수의 절집",
      "description": "여수의 바위와 바다를 마주하는 절집입니다. 계단을 오르는 시간을 포함해 일정을 잡고, 경사진 길의 상태를 확인하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1304265380",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        34.59159665,
        127.8038089
      ],
      "parking": {
        "lat": 34.5999215,
        "lng": 127.80202632862151,
        "osm": "https://www.openstreetmap.org/way/97802184",
        "distanceToPlaceMeters": 940,
        "placeCoordinate": [
          34.59159665,
          127.8038089
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1304265380"
      }
    },
    {
      "id": "neunggasa",
      "kind": "spot",
      "category": "culture",
      "name": "능가사",
      "region": "전남 고흥",
      "lat": 34.63901439999999,
      "lng": 127.414273638515,
      "lead": "팔영산 아래에서 쉬어 가는 천년고찰",
      "description": "팔영산 아래 자리한 고흥의 오래된 사찰입니다. 산행 대신 절집 주변을 짧게 걸으며 쉬어갈 수 있습니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/640489781",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        34.63901439999999,
        127.414273638515
      ],
      "parking": {
        "lat": 34.64055395,
        "lng": 127.4135980764863,
        "osm": "https://www.openstreetmap.org/way/1234176658",
        "distanceToPlaceMeters": 182,
        "placeCoordinate": [
          34.63901439999999,
          127.414273638515
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/640489781"
      }
    },
    {
      "id": "gwangju-folk-museum",
      "kind": "spot",
      "category": "culture",
      "name": "광주역사민속박물관",
      "region": "광주 북구",
      "lat": 35.1841681,
      "lng": 126.8886428,
      "lead": "광주역사민속박물관에서 잠시 쉬어가는 시간.",
      "description": "광주의 생활 문화와 민속을 소개하는 박물관입니다. 중외공원 안에서 잠시 쉬며 가까운 전시 공간을 둘러보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/368733972",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.1841681,
        126.8886428
      ],
      "parking": {
        "lat": 35.1835789,
        "lng": 126.88777515184293,
        "osm": "https://www.openstreetmap.org/way/468963211",
        "distanceToPlaceMeters": 103,
        "placeCoordinate": [
          35.1841681,
          126.8886428
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/368733972"
      }
    },
    {
      "id": "seomun-market",
      "kind": "spot",
      "category": "food",
      "name": "서문시장",
      "region": "대구 중구",
      "lat": 35.86943,
      "lng": 128.5807059,
      "lead": "서문시장에서 잠시 쉬어가는 시간.",
      "description": "대구를 대표하는 전통시장입니다. 공영 주차 구역에 바이크를 두고 가까운 시장 골목에서 식사와 휴식을 함께 챙길 수 있습니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/368867948",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.86943,
        128.5807059
      ],
      "parking": {
        "lat": 35.86887895,
        "lng": 128.58072806075631,
        "osm": "https://www.openstreetmap.org/way/769505242",
        "distanceToPlaceMeters": 61,
        "placeCoordinate": [
          35.86943,
          128.5807059
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/368867948"
      }
    },
    {
      "id": "jeongsan-hyanggyo",
      "kind": "spot",
      "category": "culture",
      "name": "정산향교",
      "region": "충남 청양",
      "lat": 36.4160532,
      "lng": 126.9441063,
      "lead": "정산향교에서 잠시 쉬어가는 시간.",
      "description": "청양 정산면에 남아 있는 조선시대 향교입니다. 시가지에서 잠시 벗어나 향교의 담장과 건물 주변을 살펴보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/8699906982",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.4160532,
        126.9441063
      ],
      "parking": {
        "lat": 36.41647345,
        "lng": 126.94518910234564,
        "osm": "https://www.openstreetmap.org/way/1509391276",
        "distanceToPlaceMeters": 108,
        "placeCoordinate": [
          36.4160532,
          126.9441063
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/8699906982"
      }
    },
    {
      "id": "korea-pop-museum",
      "kind": "spot",
      "category": "culture",
      "name": "한국대중음악박물관",
      "region": "경북 경주",
      "lat": 35.8399918,
      "lng": 129.28951,
      "lead": "한국대중음악박물관에서 잠시 쉬어가는 시간.",
      "description": "경주 보문관광단지에 있는 대중음악 박물관입니다. 음반과 음악 자료가 모인 전시 중 관심 있는 공간을 골라 짧게 관람해 보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/node/11513252411",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.8399918,
        129.28951
      ],
      "parking": {
        "lat": 35.8397695,
        "lng": 129.29145330902531,
        "osm": "https://www.openstreetmap.org/way/1167540459",
        "distanceToPlaceMeters": 177,
        "placeCoordinate": [
          35.8399918,
          129.28951
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/node/11513252411"
      }
    },
    {
      "id": "daewangam-park",
      "kind": "spot",
      "category": "nature",
      "name": "대왕암공원",
      "region": "울산 동구",
      "lat": 35.49235965,
      "lng": 129.44017771027995,
      "lead": "대왕암공원에서 잠시 쉬어가는 시간.",
      "description": "울산의 해안 바위와 소나무 숲이 만나는 공원입니다. 주차 후 입구에서 가까운 산책 구역을 중심으로 바닷바람을 느껴보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/476518093",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.49235965,
        129.44017771027995
      ],
      "parking": {
        "lat": 35.4898321,
        "lng": 129.43621751648374,
        "osm": "https://www.openstreetmap.org/way/476518086",
        "distanceToPlaceMeters": 456,
        "placeCoordinate": [
          35.49235965,
          129.44017771027995
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/476518093"
      }
    },
    {
      "id": "geological-museum",
      "kind": "spot",
      "category": "culture",
      "name": "지질박물관",
      "region": "대전 유성구",
      "lat": 36.37730795,
      "lng": 127.3631967,
      "lead": "지질박물관에서 잠시 쉬어가는 시간.",
      "description": "한국지질자원연구원의 지질박물관입니다. 광물과 화석 전시를 살펴보며 대전에서 잠시 다른 시간의 풍경을 만나보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/539424926",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.37730795,
        127.3631967
      ],
      "parking": {
        "lat": 36.3755806,
        "lng": 127.36328999952002,
        "osm": "https://www.openstreetmap.org/way/1529364859",
        "distanceToPlaceMeters": 192,
        "placeCoordinate": [
          36.37730795,
          127.3631967
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/539424926"
      }
    },
    {
      "id": "sejong-arboretum",
      "kind": "spot",
      "category": "nature",
      "name": "국립세종수목원",
      "region": "세종 세종",
      "lat": 36.49480835,
      "lng": 127.28471657775589,
      "lead": "국립세종수목원에서 잠시 쉬어가는 시간.",
      "description": "세종의 도심 수목원입니다. 넓은 전체 구역을 한 번에 돌기보다 입구와 가까운 정원이나 실내 전시를 골라 둘러보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/799013764",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.49480835,
        127.28471657775589
      ],
      "parking": {
        "lat": 36.49834045,
        "lng": 127.28283757749011,
        "osm": "https://www.openstreetmap.org/way/1113205038",
        "distanceToPlaceMeters": 427,
        "placeCoordinate": [
          36.49480835,
          127.28471657775589
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/799013764"
      }
    },
    {
      "id": "sinchang-hyanggyo",
      "kind": "spot",
      "category": "culture",
      "name": "신창향교",
      "region": "충남 아산",
      "lat": 36.7798856,
      "lng": 126.93178960193785,
      "lead": "신창향교에서 잠시 쉬어가는 시간.",
      "description": "아산 신창면에 있는 조선시대 향교입니다. 주차 후 마을과 가까운 향교 주변을 걸으며 짧게 쉬어갈 수 있습니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/930485856",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.7798856,
        126.93178960193785
      ],
      "parking": {
        "lat": 36.77418925,
        "lng": 126.93293614130229,
        "osm": "https://www.openstreetmap.org/way/601189133",
        "distanceToPlaceMeters": 642,
        "placeCoordinate": [
          36.7798856,
          126.93178960193785
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/930485856"
      }
    },
    {
      "id": "buan-guam-dolmens",
      "kind": "spot",
      "category": "culture",
      "name": "부안 구암리 고인돌",
      "region": "전북 부안",
      "lat": 35.70793155,
      "lng": 126.65448543876123,
      "lead": "부안 구암리 고인돌에서 잠시 쉬어가는 시간.",
      "description": "부안 구암리에 남아 있는 고인돌 유적입니다. 도로 가까이에서 선사시대 돌무덤의 형태를 살펴보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/946849576",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.70793155,
        126.65448543876123
      ],
      "parking": {
        "lat": 35.7077592,
        "lng": 126.6548928752054,
        "osm": "https://www.openstreetmap.org/way/946849571",
        "distanceToPlaceMeters": 41,
        "placeCoordinate": [
          35.70793155,
          126.65448543876123
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/946849576"
      }
    },
    {
      "id": "jisan-tombs",
      "kind": "spot",
      "category": "culture",
      "name": "고령 지산동 고분군",
      "region": "경북 고령",
      "lat": 35.72247555,
      "lng": 128.2592219086045,
      "lead": "고령 지산동 고분군에서 잠시 쉬어가는 시간.",
      "description": "대가야의 고분이 모여 있는 고령 지산동 유적입니다. 주차장과 가까운 전시·유적 구역을 중심으로 방문하고, 능선 전체 탐방은 별도 일정으로 계획하세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1157609217",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.72247555,
        128.2592219086045
      ],
      "parking": {
        "lat": 35.72223385,
        "lng": 128.25820699400066,
        "osm": "https://www.openstreetmap.org/way/1157579672",
        "distanceToPlaceMeters": 95,
        "placeCoordinate": [
          35.72247555,
          128.2592219086045
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1157609217"
      }
    },
    {
      "id": "seosan-hyanggyo",
      "kind": "spot",
      "category": "culture",
      "name": "서산향교",
      "region": "충남 서산",
      "lat": 36.791087950000005,
      "lng": 126.45658544596454,
      "lead": "서산향교에서 잠시 쉬어가는 시간.",
      "description": "서산의 옛 교육 공간인 향교입니다. 읍내 길에서 잠시 벗어나 담장과 건물의 모습을 살펴보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1257074855",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.791087950000005,
        126.45658544596454
      ],
      "parking": {
        "lat": 36.7913834,
        "lng": 126.4570131,
        "osm": "https://www.openstreetmap.org/node/10637482734",
        "distanceToPlaceMeters": 50,
        "placeCoordinate": [
          36.791087950000005,
          126.45658544596454
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1257074855"
      }
    },
    {
      "id": "dangjin-hyanggyo",
      "kind": "spot",
      "category": "culture",
      "name": "당진향교",
      "region": "충남 당진",
      "lat": 36.892645599999994,
      "lng": 126.63359854726009,
      "lead": "당진향교에서 잠시 쉬어가는 시간.",
      "description": "당진에 남아 있는 조선시대 향교입니다. 주차 후 가까운 건물과 주변 풍경을 짧게 둘러보는 정차 지점입니다.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1306511236",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        36.892645599999994,
        126.63359854726009
      ],
      "parking": {
        "lat": 36.8956603,
        "lng": 126.6322116664634,
        "osm": "https://www.openstreetmap.org/way/1210900865",
        "distanceToPlaceMeters": 357,
        "placeCoordinate": [
          36.892645599999994,
          126.63359854726009
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1306511236"
      }
    },
    {
      "id": "songhak-tombs",
      "kind": "spot",
      "category": "culture",
      "name": "고성 송학동 고분군",
      "region": "경남 고성",
      "lat": 34.98054405,
      "lng": 128.32107759180252,
      "lead": "고성 송학동 고분군에서 잠시 쉬어가는 시간.",
      "description": "가야의 고분이 모여 있는 고성 송학동 유적입니다. 주차장 가까운 고분과 안내 공간에서 지역의 역사를 살펴보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1308093635",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        34.98054405,
        128.32107759180252
      ],
      "parking": {
        "lat": 34.9835729,
        "lng": 128.31846655168596,
        "osm": "https://www.openstreetmap.org/way/1058948750",
        "distanceToPlaceMeters": 412,
        "placeCoordinate": [
          34.98054405,
          128.32107759180252
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1308093635"
      }
    },
    {
      "id": "okjeon-tombs",
      "kind": "spot",
      "category": "culture",
      "name": "합천 옥전 고분군",
      "region": "경남 합천",
      "lat": 35.58171895,
      "lng": 128.27971529155968,
      "lead": "합천 옥전 고분군에서 잠시 쉬어가는 시간.",
      "description": "황강 인근에 남아 있는 합천의 가야 고분군입니다. 박물관과 가까운 유적 구역을 골라 방문하고, 긴 탐방은 별도 일정으로 잡아보세요.",
      "visitNote": "주차 후 가까운 관람 구역 방문 · 운영일과 현장 이륜차 주차 조건 확인",
      "source": "https://www.openstreetmap.org/way/1512560654",
      "sourceName": "OpenStreetMap · 장소 원문",
      "visitCoordinate": [
        35.58171895,
        128.27971529155968
      ],
      "parking": {
        "lat": 35.58316265,
        "lng": 128.2789180762929,
        "osm": "https://www.openstreetmap.org/way/1512562095",
        "distanceToPlaceMeters": 176,
        "placeCoordinate": [
          35.58171895,
          128.27971529155968
        ],
        "evidence": "OSM amenity=parking, explicit access restrictions excluded; Valhalla kr-motorcycle-1 road approach verified 2026-10-14",
        "placeSource": "https://www.openstreetmap.org/way/1512560654"
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
    },
    "hwaseong-fortress": {
      "image": "/web/app/assets/spots/hwaseong-fortress.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Hwaseong_Fortress_01.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/e/ed/Hwaseong_Fortress_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Bernard Gagnon",
      "photoLicense": "CC0",
      "photoLicenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "yunggeolleung": {
      "image": "/web/app/assets/spots/yunggeolleung.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Family_Feud_Grave_Site_(180816301).jpeg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/d/db/Family_Feud_Grave_Site_%28180816301%29.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Mathew Schwartz",
      "photoLicense": "CC BY 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "silleuksa": {
      "image": "/web/app/assets/spots/silleuksa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Silleuksa_Temple_-_Geungnakbojeon_IMG_2188.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/6/6d/Silleuksa_Temple_-_Geungnakbojeon_IMG_2188.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "G41rn8",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "seolbong-park": {
      "image": "/web/app/assets/spots/seolbong-park.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Seolbong_Park,_Icheon.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/4/44/Seolbong_Park%2C_Icheon.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Mikhail Kim",
      "photoLicense": "CC BY-SA 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "dumulmeori": {
      "image": "/web/app/assets/spots/dumulmeori.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Yangpyeong_Dumulmeori_2019-11-11.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/54/Yangpyeong_Dumulmeori_2019-11-11.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Foxy1219",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "anseong-cheongryongsa": {
      "image": "/web/app/assets/spots/anseong-cheongryongsa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%95%88%EC%84%B1_%EC%B2%AD%EB%A3%A1%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84_%EB%B0%B0%EB%A9%B4_%EC%A0%84%EA%B2%BD_(%EC%B4%AC%EC%98%81%EB%85%84%EB%8F%84_2015%EB%85%84)_01.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/58/%EC%95%88%EC%84%B1_%EC%B2%AD%EB%A3%A1%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84_%EB%B0%B0%EB%A9%B4_%EC%A0%84%EA%B2%BD_%28%EC%B4%AC%EC%98%81%EB%85%84%EB%8F%84_2015%EB%85%84%29_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Cultural Heritage Authority",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "http://www.kogl.or.kr/info/licenseType1.do",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "chiljangsa": {
      "image": "/web/app/assets/spots/chiljangsa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%95%88%EC%84%B1_%EC%B9%A0%EC%9E%A5%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84_%EC%A0%95%EB%A9%B4.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/06/%EC%95%88%EC%84%B1_%EC%B9%A0%EC%9E%A5%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84_%EC%A0%95%EB%A9%B4.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Encyclopedia of Korean Culture",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "http://www.kogl.or.kr/info/licenseType1.do",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "namhansanseong": {
      "image": "/web/app/assets/spots/namhansanseong.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Namhansanseong-06.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Korea-Namhansanseong-06.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814 (talk)",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "railroad-museum": {
      "image": "/web/app/assets/spots/railroad-museum.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea_Railroad_Museum.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/2/25/Korea_Railroad_Museum.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "조사부장 from kowp",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "samsung-transport": {
      "image": "/web/app/assets/spots/samsung-transport.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Samsung_Transportation_Museum,_Yongin_(%EC%82%BC%EC%84%B1%ED%99%94%EC%9E%AC%EA%B5%90%ED%86%B5%EB%B0%95%EB%AC%BC%EA%B4%80,_%EC%9A%A9%EC%9D%B8)_-_panoramio_(1).jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/2/20/Samsung_Transportation_Museum%2C_Yongin_%28%EC%82%BC%EC%84%B1%ED%99%94%EC%9E%AC%EA%B5%90%ED%86%B5%EB%B0%95%EB%AC%BC%EA%B4%80%2C_%EC%9A%A9%EC%9D%B8%29_-_panoramio_%281%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "골뱅이",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "pungsuwon": {
      "image": "/web/app/assets/spots/pungsuwon.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:2020-04-22_14.01.12_%ED%92%8D%EC%88%98%EC%9B%90%EC%84%B1%EB%8B%B9.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/b/b1/2020-04-22_14.01.12_%ED%92%8D%EC%88%98%EC%9B%90%EC%84%B1%EB%8B%B9.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Choi Kwang-mo",
      "photoLicense": "CC0",
      "photoLicenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "sutasa": {
      "image": "/web/app/assets/spots/sutasa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%88%98%ED%83%80%EC%82%AC(%ED%99%8D%EC%B2%9C%EA%B5%B0_%EB%8F%99%EB%A9%B4)IMG_3767.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/3/32/%EC%88%98%ED%83%80%EC%82%AC%28%ED%99%8D%EC%B2%9C%EA%B5%B0_%EB%8F%99%EB%A9%B4%29IMG_3767.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "최광모 (Choe Kwangmo)",
      "photoLicense": "CC0",
      "photoLicenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "parksugeun": {
      "image": "/web/app/assets/spots/parksugeun.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EB%B0%95%EC%88%98%EA%B7%BC%EB%AF%B8%EC%88%A0%EA%B4%80-tourgo.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c9/%EB%B0%95%EC%88%98%EA%B7%BC%EB%AF%B8%EC%88%A0%EA%B4%80-tourgo.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "한국문화관광연구원",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "http://www.kogl.or.kr/info/licenseType1.do",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "kimyujeong": {
      "image": "/web/app/assets/spots/kimyujeong.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EA%B9%80%EC%9C%A0%EC%A0%95%EB%AC%B8%ED%95%99%EC%B4%8C.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/9/94/%EA%B9%80%EC%9C%A0%EC%A0%95%EB%AC%B8%ED%95%99%EC%B4%8C.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "문화포털",
      "photoLicense": "CC BY 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "daegwallyeong-sheep": {
      "image": "/web/app/assets/spots/daegwallyeong-sheep.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Daegwallyeong_Sheep_Farm.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/e/ea/Daegwallyeong_Sheep_Farm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Ken Eckert",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "gossi-cave": {
      "image": "/web/app/assets/spots/gossi-cave.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Gossi_Cave.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/1/13/Gossi_Cave.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Korea.net / Korean Culture and Information Service",
      "photoLicense": "CC BY-SA 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "hwangji": {
      "image": "/web/app/assets/spots/hwangji.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Hwangji_Pond_Taebaek_City_20260713_(04).jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Hwangji_Pond_Taebaek_City_20260713_%2804%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Treeinkr",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "pohang-jukdo": {
      "image": "/web/app/assets/spots/pohang-jukdo.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:SpiceDisplay.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/8/80/SpiceDisplay.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Yagobo79",
      "photoLicense": "Public domain",
      "photoLicenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "guryongpo-history": {
      "image": "/web/app/assets/spots/guryongpo-history.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Guryongpo_Japanese_House_Street_20240113_002.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/7/70/Guryongpo_Japanese_House_Street_20240113_002.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Mobius6",
      "photoLicense": "CC BY 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "daejeonsa": {
      "image": "/web/app/assets/spots/daejeonsa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Daejeonsa_%26_Juwang_Mt.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/8/89/Daejeonsa_%26_Juwang_Mt.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Trainholic",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "seoseokji": {
      "image": "/web/app/assets/spots/seoseokji.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%84%9C%EC%84%9D%EC%A7%80.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/b/b1/%EC%84%9C%EC%84%9D%EC%A7%80.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Metal526",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "hoeryongpo": {
      "image": "/web/app/assets/spots/hoeryongpo.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Hoeryongpo.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Hoeryongpo.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "w:ko:사용자:Salamander03's father",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "baekdudaegan-arboretum": {
      "image": "/web/app/assets/spots/baekdudaegan-arboretum.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EA%B5%AD%EB%A6%BD%EB%B0%B1%EB%91%90%EB%8C%80%EA%B0%84%EC%88%98%EB%AA%A9%EC%9B%90_%EC%97%AC%ED%96%89%EC%9E%90%EC%84%BC%ED%84%B0.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/7/7f/%EA%B5%AD%EB%A6%BD%EB%B0%B1%EB%91%90%EB%8C%80%EA%B0%84%EC%88%98%EB%AA%A9%EC%9B%90_%EC%97%AC%ED%96%89%EC%9E%90%EC%84%BC%ED%84%B0.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "메라크",
      "photoLicense": "CC BY 2.0 kr",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/2.0/kr/deed.en",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "munmu-tomb": {
      "image": "/web/app/assets/spots/munmu-tomb.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Underwater_Tomb_of_King_Munmu.jpeg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Underwater_Tomb_of_King_Munmu.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "vatar/편성재",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "golgulsa": {
      "image": "/web/app/assets/spots/golgulsa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Golgulsa,_Gyeongju_01.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/2/24/Golgulsa%2C_Gyeongju_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Seefooddiet",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "beopjusa": {
      "image": "/web/app/assets/spots/beopjusa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Boeun-Beopjusa_Palsangjeon_and_Bell_Pavilion_1765-06.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/b/b5/Korea-Boeun-Beopjusa_Palsangjeon_and_Bell_Pavilion_1765-06.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "bogangcheon": {
      "image": "/web/app/assets/spots/bogangcheon.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Bogangcheon_Cottonwood_Grove.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Bogangcheon_Cottonwood_Grove.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Kim Youngho",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "http://www.kogl.or.kr/info/licenseType1.do",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "jincheon-nongdari": {
      "image": "/web/app/assets/spots/jincheon-nongdari.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Jincheon_Nongdari_Bridge_20200716_160025.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/b/b0/Jincheon_Nongdari_Bridge_20200716_160025.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Piotrus",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "yeongguksa": {
      "image": "/web/app/assets/spots/yeongguksa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%98%81%EB%8F%99%EC%98%81%EA%B5%AD%EC%82%AC%EC%9D%98%EC%9D%80%ED%96%89%EB%82%98%EB%AC%B4.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/2/2b/%EC%98%81%EB%8F%99%EC%98%81%EA%B5%AD%EC%82%AC%EC%9D%98%EC%9D%80%ED%96%89%EB%82%98%EB%AC%B4.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Korea Heritage Service",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "http://www.kogl.or.kr/info/licenseType1.do",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "sanmagi": {
      "image": "/web/app/assets/spots/sanmagi.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea_Goesangun_09_(15052415893).jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/53/Korea_Goesangun_09_%2815052415893%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Republic of  Korea from Seoul, Republic of Korea",
      "photoLicense": "CC BY-SA 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "uirimji": {
      "image": "/web/app/assets/spots/uirimji.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Uirimji_Reservoir_(3)_(32813000084).jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/1/15/Uirimji_Reservoir_%283%29_%2832813000084%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Kyle Magnuson from Los Angeles, United States",
      "photoLicense": "CC BY 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "independence-hall": {
      "image": "/web/app/assets/spots/independence-hall.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Independence_Hall_of_Korea_01.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/53/Independence_Hall_of_Korea_01.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Lawinc82",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "hyeonchungsa": {
      "image": "/web/app/assets/spots/hyeonchungsa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Asan-Spring_garden_near_Hyeonchungsa-01.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/2/2c/Korea-Asan-Spring_garden_near_Hyeonchungsa-01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Jo from Brisbane, Australia",
      "photoLicense": "CC BY 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "gwanchoksa": {
      "image": "/web/app/assets/spots/gwanchoksa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Gwanchoksa_-_Courtyard_IMG_20160928_035626.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/4/48/Gwanchoksa_-_Courtyard_IMG_20160928_035626.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "G41rn8",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "donam-seowon": {
      "image": "/web/app/assets/spots/donam-seowon.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Donam_Seowon.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/05/Donam_Seowon.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Ryuch",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "boseoksa": {
      "image": "/web/app/assets/spots/boseoksa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EB%B3%B4%EC%84%9D%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/0c/%EB%B3%B4%EC%84%9D%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Korea Heritage Service",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "janggoksa": {
      "image": "/web/app/assets/spots/janggoksa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Janggoksa_Temple_Main_Hall_Front.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/a/ae/Janggoksa_Temple_Main_Hall_Front.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Tungdangthanh",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "haeinsa": {
      "image": "/web/app/assets/spots/haeinsa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Haeinsa_Temple_01.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/e/e5/Haeinsa_Temple_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Bernard Gagnon",
      "photoLicense": "CC0",
      "photoLicenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "upo-wetland": {
      "image": "/web/app/assets/spots/upo-wetland.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Upo_Wetland%27s_Many_Colours.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/3/3d/Upo_Wetland%27s_Many_Colours.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Speedyturtle2000",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "namhae-german-village": {
      "image": "/web/app/assets/spots/namhae-german-village.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:View_of_German_Village_in_Namhae,_South_Korea.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/8/87/View_of_German_Village_in_Namhae%2C_South_Korea.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Choi2451",
      "photoLicense": "CC0",
      "photoLicenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "daeheungsa": {
      "image": "/web/app/assets/spots/daeheungsa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Daeheungsa_11-03878.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Daeheungsa_11-03878.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "usuyoung": {
      "image": "/web/app/assets/spots/usuyoung.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Haenam_Where_nature_meets_history,_culture.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Haenam_Where_nature_meets_history%2C_culture.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "USAG- Humphreys",
      "photoLicense": "CC BY 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "gokseong-rail-village": {
      "image": "/web/app/assets/spots/gokseong-rail-village.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Oldgokseongst.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/07/Oldgokseongst.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Kimhs5400(블루시티)",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "jeoksang-records": {
      "image": "/web/app/assets/spots/jeoksang-records.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Muju-Jeoksangsan-Fortress.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Muju-Jeoksangsan-Fortress.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Dittwjfsdgkvkdjg",
      "photoLicense": "CC BY 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "seonyudo": {
      "image": "/web/app/assets/spots/seonyudo.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Seonyu_island.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/54/Seonyu_island.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "The original uploader was Albam at Korean Wikipedia.",
      "photoLicense": "CC BY 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "silsangsa": {
      "image": "/web/app/assets/spots/silsangsa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Three-story_Stone_Pagodas_of_Silsangsa_Temple.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Three-story_Stone_Pagodas_of_Silsangsa_Temple.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "한국저작권위원회 · 작자 미상",
      "photoLicense": "Public domain",
      "photoLicenseUrl": "https://creativecommons.org/publicdomain/mark/1.0/",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "maisantapsa": {
      "image": "/web/app/assets/spots/maisantapsa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Jinan-Tapsa_and_Stone_Pagodas_3704-07.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/0f/Korea-Jinan-Tapsa_and_Stone_Pagodas_3704-07.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "donghwasa": {
      "image": "/web/app/assets/spots/donghwasa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Daegu-Donghwasa-01.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/59/Korea-Daegu-Donghwasa-01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "by martinroell",
      "photoLicense": "CC BY-SA 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "jangtaesan": {
      "image": "/web/app/assets/spots/jangtaesan.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:View_from_the_Jangtaesan.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/d/de/View_from_the_Jangtaesan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "VaneTrz20",
      "photoLicense": "CC0",
      "photoLicenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "ulsan-taehwa": {
      "image": "/web/app/assets/spots/ulsan-taehwa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Taehwagang_National_Garden_20221125_075.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/e/eb/Taehwagang_National_Garden_20221125_075.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Mobius6",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "hanhyeong-view": {
      "image": "/web/app/assets/spots/hanhyeong-view.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Sinseong2.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/e/ea/Sinseong2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Dittwjfsdgkvkdjg",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "dosan-seowon": {
      "image": "/web/app/assets/spots/dosan-seowon.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Andong-Dosan_Seowon_3001%2600%2601-06.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Korea-Andong-Dosan_Seowon_3001%2600%2601-06.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "bongjeongsa": {
      "image": "/web/app/assets/spots/bongjeongsa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Andong-Bongjeongsa_3040-06_Geungnakjeon.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/6/68/Korea-Andong-Bongjeongsa_3040-06_Geungnakjeon.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "gakyeonsa": {
      "image": "/web/app/assets/spots/gakyeonsa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EA%B0%81%EC%97%B0%EC%82%AC.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/2/29/%EA%B0%81%EC%97%B0%EC%82%AC.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Dalgial",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "kimjwajin": {
      "image": "/web/app/assets/spots/kimjwajin.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Birthplace_of_Kim_Chwa-chin.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/2/2b/Birthplace_of_Kim_Chwa-chin.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Trainholic",
      "photoLicense": "CC BY 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "mallipo": {
      "image": "/web/app/assets/spots/mallipo.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%ED%83%9C%EC%95%88%ED%95%B4%EC%95%88%EA%B5%AD%EB%A6%BD%EA%B3%B5%EC%9B%90_%EB%A7%8C%EB%A6%AC%ED%8F%AC_%EC%9D%BC%EB%AA%B0.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/9/98/%ED%83%9C%EC%95%88%ED%95%B4%EC%95%88%EA%B5%AD%EB%A6%BD%EA%B3%B5%EC%9B%90_%EB%A7%8C%EB%A6%AC%ED%8F%AC_%EC%9D%BC%EB%AA%B0.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Olga Lipunova",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "hwangtohyeon": {
      "image": "/web/app/assets/spots/hwangtohyeon.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EA%B5%AC%EB%AF%BC%EC%82%AC.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/d/de/%EA%B5%AC%EB%AF%BC%EC%82%AC.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "주경천",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "imsil-cheese": {
      "image": "/web/app/assets/spots/imsil-cheese.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Imsilgun_County_04_(16597675160).jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Imsilgun_County_04_%2816597675160%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Republic of  Korea from Seoul, Republic of Korea",
      "photoLicense": "CC BY-SA 2.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "namgye-seowon": {
      "image": "/web/app/assets/spots/namgye-seowon.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%ED%95%A8%EC%96%91_%EB%82%A8%EA%B3%84%EC%84%9C%EC%9B%902.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/a/af/%ED%95%A8%EC%96%91_%EB%82%A8%EA%B3%84%EC%84%9C%EC%9B%902.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "국가유산청",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "http://www.kogl.or.kr/info/licenseType1.do",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "naewonsa": {
      "image": "/web/app/assets/spots/naewonsa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%96%91%EC%82%B0_%EB%82%B4%EC%9B%90%EC%82%AC.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/d/d4/%EC%96%91%EC%82%B0_%EB%82%B4%EC%9B%90%EC%82%AC.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "국가유산청",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "http://www.kogl.or.kr/info/licenseType1.do",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "hyangiram": {
      "image": "/web/app/assets/spots/hyangiram.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Hyangiram_hermitage_03.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/00/Hyangiram_hermitage_03.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Tour Go: Tourism Knowledge Information System",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "http://www.kogl.or.kr/info/licenseType1.do",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "neunggasa": {
      "image": "/web/app/assets/spots/neunggasa.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:South_Korea-Goheunggun-Neunggasa_5841-07.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/6/64/South_Korea-Goheunggun-Neunggasa_5841-07.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "gwangju-folk-museum": {
      "image": "/web/app/assets/spots/gwangju-folk-museum.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea-Gwangju_Folk_Museum_4650-07.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/8/86/Korea-Gwangju_Folk_Museum_4650-07.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Steve46814",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "seomun-market": {
      "image": "/web/app/assets/spots/seomun-market.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:10%EA%B2%BD_%EC%84%9C%EB%AC%B8%EC%8B%9C%EC%9E%A5.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/f/fd/10%EA%B2%BD_%EC%84%9C%EB%AC%B8%EC%8B%9C%EC%9E%A5.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "대구광역시",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "jeongsan-hyanggyo": {
      "image": "/web/app/assets/spots/jeongsan-hyanggyo.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%A0%95%EC%82%B0%ED%96%A5%EA%B5%90.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/6/63/%EC%A0%95%EC%82%B0%ED%96%A5%EA%B5%90.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "한국학중앙연구원·유남해",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "http://www.kogl.or.kr/info/licenseType1.do",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "korea-pop-museum": {
      "image": "/web/app/assets/spots/korea-pop-museum.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Korea_populer_music_museum.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/7/73/Korea_populer_music_museum.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "User:Altostratus",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "daewangam-park": {
      "image": "/web/app/assets/spots/daewangam-park.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Daewangam_Park.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/3/35/Daewangam_Park.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Shinfull",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "geological-museum": {
      "image": "/web/app/assets/spots/geological-museum.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%A7%80%EC%A7%88%EB%B0%95%EB%AC%BC%EA%B4%80_Geological_Museum_KIGAM.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/d/d1/%EC%A7%80%EC%A7%88%EB%B0%95%EB%AC%BC%EA%B4%80_Geological_Museum_KIGAM.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Rickinasia",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "sejong-arboretum": {
      "image": "/web/app/assets/spots/sejong-arboretum.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EA%B5%AD%EB%A6%BD%EC%84%B8%EC%A2%85%EC%88%98%EB%AA%A9%EC%9B%901.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/0b/%EA%B5%AD%EB%A6%BD%EC%84%B8%EC%A2%85%EC%88%98%EB%AA%A9%EC%9B%901.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "파란색 하늘",
      "photoLicense": "CC BY-SA 3.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "sinchang-hyanggyo": {
      "image": "/web/app/assets/spots/sinchang-hyanggyo.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%8B%A0%EC%B0%BD%ED%96%A5%EA%B5%90_%EC%A0%84%EA%B2%BD_(%EC%B4%AC%EC%98%81%EB%85%84%EB%8F%84_2015%EB%85%84).jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/f/fa/%EC%8B%A0%EC%B0%BD%ED%96%A5%EA%B5%90_%EC%A0%84%EA%B2%BD_%28%EC%B4%AC%EC%98%81%EB%85%84%EB%8F%84_2015%EB%85%84%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Korean Cultural Heritage Administration",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "http://www.kogl.or.kr/info/licenseType1.do",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "buan-guam-dolmens": {
      "image": "/web/app/assets/spots/buan-guam-dolmens.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EB%B6%80%EC%95%88_%EA%B5%AC%EC%95%94%EB%A6%AC_%EC%A7%80%EC%84%9D%EB%AC%98%EA%B5%B0.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/4/47/%EB%B6%80%EC%95%88_%EA%B5%AC%EC%95%94%EB%A6%AC_%EC%A7%80%EC%84%9D%EB%AC%98%EA%B5%B0.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "문화재청 (공공누리 제1유형)",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "http://www.kogl.or.kr/info/licenseType1.do",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "jisan-tombs": {
      "image": "/web/app/assets/spots/jisan-tombs.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EA%B3%A0%EB%A0%B9_%EC%A7%80%EC%82%B0%EB%8F%99_%EA%B3%A0%EB%B6%84%EA%B5%B0.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/2/26/%EA%B3%A0%EB%A0%B9_%EC%A7%80%EC%82%B0%EB%8F%99_%EA%B3%A0%EB%B6%84%EA%B5%B0.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "최옥석",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "seosan-hyanggyo": {
      "image": "/web/app/assets/spots/seosan-hyanggyo.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%EC%84%9C%EC%82%B0%ED%96%A5%EA%B5%901.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/8/83/%EC%84%9C%EC%82%B0%ED%96%A5%EA%B5%901.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "Seosan City Government",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "dangjin-hyanggyo": {
      "image": "/web/app/assets/spots/dangjin-hyanggyo.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%ED%83%9C%EC%95%88_%EB%8B%B9%EC%A7%84%ED%96%A5%EA%B5%90_%EB%AA%85%EB%A5%9C%EB%8B%B9.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/4/41/%ED%83%9C%EC%95%88_%EB%8B%B9%EC%A7%84%ED%96%A5%EA%B5%90_%EB%AA%85%EB%A5%9C%EB%8B%B9.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "This file is licensed under the Korea Open Government License Type 1.\n\n\nAttribution: 문화재청\n\n\n\nYou are free:\nto share – to copy, distribute and transmit the work online or offline, for commercial or non-commercial purposes\nto remix – to adapt the work\nUnder the following conditions:\nattribution – You must specify the source of the work.\nhttp://www.kogl.or.kr/info/licenseType1.doKOGL Type 1공공누리 제1유형 출처 표시truetrue",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "http://www.kogl.or.kr/info/licenseType1.do",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "songhak-tombs": {
      "image": "/web/app/assets/spots/songhak-tombs.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:Goseong_Seonghak_Tomb_01.JPG",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/b/b4/Goseong_Seonghak_Tomb_01.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "hyolee2",
      "photoLicense": "CC BY-SA 4.0",
      "photoLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    },
    "okjeon-tombs": {
      "image": "/web/app/assets/spots/okjeon-tombs.webp?v=spots-200",
      "photoSource": "https://commons.wikimedia.org/wiki/File:%ED%95%A9%EC%B2%9C_%EC%98%A5%EC%A0%84_%EA%B3%A0%EB%B6%84%EA%B5%B0.jpg",
      "photoOriginalUrl": "https://upload.wikimedia.org/wikipedia/commons/3/30/%ED%95%A9%EC%B2%9C_%EC%98%A5%EC%A0%84_%EA%B3%A0%EB%B6%84%EA%B5%B0.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
      "photoCredit": "문화재청",
      "photoLicense": "KOGL Type 1",
      "photoLicenseUrl": "http://www.kogl.or.kr/info/licenseType1.do",
      "photoKind": "PLACE_PHOTO",
      "photoVerifiedAt": "2026-10-14",
      "photoChanges": "960px 이내 리사이즈 · WebP 변환",
      "reuseStatus": "verified"
    }
  }
};
  root.SSKR_SPOT_CURATION=data;
  if(typeof module!=='undefined')module.exports=data;
})(typeof window!=='undefined'?window:globalThis);
