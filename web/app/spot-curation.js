/* 경유 스팟: OSM 2026-09-24 주차 구역과 이륜차 도로 접근 대조. */
(function(root){
  const data = {
  "removedIds": [
    "allride",
    "aviation-museum",
    "baekseoktan",
    "buryeongsa",
    "cafe-299",
    "cafe-sann",
    "cheonjangho",
    "daegwallyeong",
    "daksil",
    "g-rider",
    "gangcheonsan",
    "gyeongcheondae",
    "harleywood",
    "hoeryongpo",
    "hue-cafe-138",
    "huinnyeoul",
    "hwasun-red-cliff",
    "hwawangsan",
    "hwayang",
    "imgo",
    "jeokbyeokgang",
    "junam-reservoir",
    "jusanji",
    "maltijae",
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
    "sanmagi",
    "seondol",
    "seongjusa",
    "two-stroke",
    "upo-wetland",
    "walking-stone"
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
      "corridor": "north",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "north",
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
      "corridor": "north",
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
      "corridor": "south",
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
      "corridor": "west",
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
      "corridor": "south",
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
      "corridor": "north",
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
      "corridor": "south",
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
      "corridor": "north",
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
      "corridor": "central",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "north",
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
      "corridor": "west",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "west",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "west",
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
      "corridor": "north",
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
      "corridor": "north",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "north",
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
      "corridor": "north",
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
      "corridor": "south",
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
      "corridor": "south",
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
      "corridor": "north",
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
    }
  ]
};
  root.SSKR_SPOT_CURATION=data;
  if(typeof module!=="undefined")module.exports=data;
})(typeof window!=="undefined"?window:globalThis);
