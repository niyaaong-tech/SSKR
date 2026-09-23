/* APP 탐색 카탈로그. 기존 Explore 30곳은 원본을 참조하며 APP에서만 확장한다. */
(function(root){
  const base=root.SSKR_PLACES||(typeof require!=='undefined'?require('../explore/places.js'):[]);
  const culture=new Set(['cheongnyeongpo','cheongpung','buryeongsa','buncheon','daksil','museom','mungyeong','hahoe','imgo','hwabon','jikjisa','munui','magoksa','baekje','seongjusa']);
  const places=base.map(p=>({...p,category:['cafe-sann','gaeun'].includes(p.id)?'cafe':culture.has(p.id)?'culture':'nature'}));
  const tourism=id=>'https://data.visitkorea.or.kr/linkedview/'+id;
  const cafeNote='운영일과 주차 위치를 방문 전 확인하세요. 주거지 인근에서는 공회전과 소음을 줄여 주세요.';
  const cafeRows=[
    ['the-road-1423','더 로드 1423','강원 · 영월','north',37.27,128.27,'강원 영월군 주천면 송학주천로 1423','주천강 길에서 커피 한 잔.','영월 주천면을 달리다 쉬어가는 라이더 카페입니다. 음악을 들으며 다음 고갯길과 쉬어갈 시간을 정리해 보세요.','https://www.mbzine.com/archives/24204'],
    ['road-66','66로드카페','강원 · 태백','north',37.16,128.99,'강원 태백시 태백로 1038','고원 도시에서 잠시 쉬어가기.','바이크 소품이 있는 태백의 카페입니다. 산간 도로의 긴 구간 사이에 커피와 휴식을 더할 수 있습니다.','https://www.diningcode.com/profile.php?rid=mAW5e5hVpasx'],
    ['rc79','RC79','강원 · 홍천','north',37.60,127.81,'강원 홍천군 남면 설악로 119-1','홍천 산길을 잇는 라이더 쉼터.','바이크 주차 공간과 라이더 편의시설로 알려진 카페입니다. 북쪽으로 넓게 돌아가는 일정에 맞춰 들를 수 있습니다.','https://www.diningcode.com/profile.php?rid=6ZgCl2IK63LP'],
    ['neumanjang','느만장','강원 · 춘천','north',37.89,127.83,'강원 춘천시 동면 가락재로 177','한옥 마당에서 나누는 라이딩 이야기.','춘천 동면의 라이더 카페입니다. 한옥과 마당의 분위기를 즐기며 강원 북부 투어의 휴식점으로 살펴보세요.','https://www.diningcode.com/profile.php?rid=7x6dEEJsUWGo'],
    ['bikongs','바이콩즈','충남 · 공주','west',36.36,127.25,'충남 공주시 반포면 동학사1로 82','동학사 길목, 바이크와 커피.','동학사 방면에서 라이더들이 모이는 카페입니다. 계룡산 주변을 둘러본 뒤 서쪽 구간으로 넘어가기 전 쉬어갈 수 있습니다.','https://www.mbzine.com/archives/26161'],
    ['harleywood','할리우드','충남 · 천안','west',36.80,127.18,'충남 천안시 동남구 유량로 185','유량동에서 만나는 라이더들의 공간.','모터사이클과 라이더 문화가 있는 천안의 카페입니다. 셀프 정비 도구 등 편의시설 이용은 매장에 확인해 주세요.','https://www.kmnews.net/RIDERCAFE/?bmode=view&idx=10655571'],
    ['hichichi','하이치치','충남 · 당진','west',36.89,126.82,'충남 당진시 신평면 삽교천길 21','삽교호 가까이, 잠깐의 커피 정차.','삽교호를 찾는 라이더들이 들르는 카페입니다. 호수와 서해안의 풍경을 이어가는 일정에 맞춰 방문해 보세요.','https://www.esquirekorea.co.kr/article/1885152'],
    ['walking-stone','워킹스톤','충북 · 청주','central',36.68,127.51,'충북 청주시 청원구 충청대로 324','그래피티와 바이크가 만나는 카페.','바이크 주차 구획과 큰 벽화로 알려진 카페입니다. 청주 북쪽에서 내륙 구간의 식사나 휴식 일정을 이어갈 수 있습니다.','https://www.diningcode.com/profile.php?rid=EU8FvJ8NEUcl'],
    ['royce','카페로이스','충북 · 청주','central',36.59,127.61,'충북 청주시 상당구 낭성면 단재로 1822','낭성의 들길에서 쉬어가는 커피.','청주 외곽 낭성면의 모터 카페입니다. 대청호와 보은을 연결하는 일정에서 한숨 돌리는 장소로 살펴보세요.','https://www.diningcode.com/profile.php?rid=5AlTsygF7CfY'],
    ['rpm-moto','알피엠모토카페','경북 · 상주','central',36.43,128.26,'경북 상주시 상주다인로 61-40','낙동강 권역의 모터사이클 쉼터.','바이크 주차장과 라이더 편의시설이 소개된 상주의 카페입니다. 강변을 달린 뒤 장비를 정리하고 쉬어갈 수 있습니다.','https://www.diningcode.com/profile.php?rid=eGxCUP60RDrx'],
    ['allride','올라이드','경북 · 구미','south',36.30,128.33,'경북 구미시 도개면 도안로 119','구미 북쪽, 라이더들이 만나는 곳.','도개면에 있는 라이더 카페입니다. 낙동강 주변 길을 둘러본 뒤 커피를 마시며 다음 방문지를 고르기 좋습니다.','https://www.mbzine.com/archives/24204'],
    ['mad-brown','매드브라운','경북 · 구미','south',36.10,128.33,'경북 구미시 형곡서로 38','바이크 취향이 담긴 로스팅 카페.','산장 같은 분위기와 커피가 있는 구미의 카페입니다. 시가지 경유가 포함되는 일정에 한해 휴식 후보로 살펴보세요.','https://www.diningcode.com/profile.php?rid=7y59sw2oUX5v'],
    ['route7','카페클럽하우스루트7','경북 · 포항','south',36.23,129.36,'경북 포항시 북구 송라면 동해대로 2829','7번 국도에서 잠시 멈추는 클럽하우스.','동해안 투어 중 라이더들의 방문 기록이 있는 카페입니다. 송라면 해안 구간과 함께 살펴볼 수 있습니다.','https://www.diningcode.com/profile.php?rid=iBB6RTYWKuxx'],
    ['cafe-299','299카페','경북 · 경주','south',35.77,129.49,'경북 경주시 감포읍 나정길 3','감포 해안 여정의 커피 한 잔.','경주 감포를 달리는 라이더들의 방문지입니다. 나정 해변 주변을 둘러본 뒤 내륙으로 넘어가기 전 쉬어갈 수 있습니다.','https://dev-story.kr/26'],
    ['hwasodam','화소담','경북 · 경주','south',35.67,129.46,'경북 경주시 양남면 서동길 1','양남의 마당에서 쉬어가는 오후.','잔디 마당과 먹거리가 있는 라이더 방문 카페입니다. 경주 남쪽 해안에서 출발하거나 머무는 일정에 더해보세요.','https://www.diningcode.com/profile.php?rid=BLhhVsyJ6uv3'],
    ['road-runner','로드러너','경기 · 양평','north',37.48,127.40,'경기 양평군 강하면 왕창로 41','남한강 권역의 라이더 만남 장소.','양평 강하면의 바이크 카페입니다. 동서 횡단을 북쪽으로 넓게 돌아갈 때 경유 후보로 고를 수 있습니다.','https://www.reitwagen.co.kr/posts/2147'],
    ['g-rider','지라이더','경기 · 양평','north',37.479,127.401,'경기 양평군 강하면 왕창로 35','바이크와 모형 취향을 함께 즐기는 곳.','양평의 라이더 카페로 바이크와 모형을 함께 구경할 수 있습니다. 주말 위주 운영 여부를 확인한 뒤 방문해 주세요.','https://www.theneweconomy.kr/news/articleView.html?idxno=11658'],
    ['two-stroke','투스트록','경기 · 양평','north',37.53,127.39,'경기 양평군 양서면 광장옆길 2','만남의 광장 옆, 커피와 수제버거.','양평 만남의 광장 인근에 소개된 라이더 카페입니다. 쉬면서 간단히 식사하는 경유점으로 살펴보세요.','https://www.motorcycle-story.com/post/727'],
    ['hue-cafe-138','휴카페138','전북 · 무주','south',35.93,127.68,'전북 무주군 적상면 치마재로 138','무주의 굽잇길 사이에 놓는 쉼표.','모터사이클 방문 행사가 소개된 무주의 카페입니다. 남부 권역을 넓게 둘러보는 일정에 맞춰 쉬어갈 수 있습니다.','https://www.kmnews.net/SPECIAL/?bmode=view&idx=6405213'],
    ['namaste','나마스테','전북 · 완주','south',36.11,127.32,'전북 완주군 운주면 대둔산로 2056','대둔산을 바라보며 쉬는 시간.','대둔산 권역을 달리는 라이더들의 방문 기록이 있는 카페입니다. 산 풍경과 커피를 즐기는 휴식점으로 살펴보세요.','https://www.diningcode.com/profile.php?rid=sL6uvvOyg4KE']
  ];
  cafeRows.forEach(([id,name,region,corridor,lat,lng,address,lead,description,source])=>places.push({id,name,region,corridor,lat,lng,address,lead,description,source,kind:'spot',category:'cafe',riderCafe:true,note:cafeNote,coordinateAccuracy:'approximate',image:'',reuseStatus:'unverified'}));
  const marketRows=[
    ['gangneung-market','강릉중앙시장','강원 · 강릉','north',37.754052,128.898661,'강릉시 금성로 21','옹심이와 메밀전, 강릉 장터의 한 끼.',132771],
    ['jumunjin-market','주문진수산시장','강원 · 강릉','north',37.891370,128.827945,'강릉시 주문진읍 시장길 38','수산물과 건어물이 모이는 항구 장터.','https://www.gn.go.kr/www/sub.do?key=573'],
    ['donghae-market','동쪽바다중앙시장','강원 · 동해','north',37.550879,129.108984,'동해시 중앙시장길 10','묵호항의 골목에서 만나는 생선구이.',132776],
    ['bukpyeong-market','북평민속오일장','강원 · 동해','north',37.482532,129.126063,'동해시 오일장길 32','해산물과 메밀 음식이 모이는 큰 장터.',132780],
    ['jeongseon-market','정선아리랑시장','강원 · 정선','north',37.380582,128.664816,'정선군 정선읍 5일장길 40','곤드레와 콧등치기국수, 정선의 맛.',132003],
    ['bongpyeong-market','봉평전통시장','강원 · 평창','north',37.6156,128.3773,'평창군 봉평면 동이장터길 14-1','메밀 음식으로 기억하는 봉평의 장날.','https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=70561'],
    ['yeongwol-market','영월서부시장','강원 · 영월','north',37.183,128.465,'영월군 영월읍 중앙로 30-1','메밀부침과 산나물을 찾아 걷는 골목.','https://french.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=75870'],
    ['danyang-market','단양구경시장','충북 · 단양','north',36.982481,128.369840,'단양군 단양읍 도전5길 31','마늘만두와 지역 먹거리를 고르는 재미.',132258],
    ['jecheon-market','제천역전한마음시장','충북 · 제천','north',37.129466,128.206895,'제천시 내토로28길 3-1','기차역 앞, 약초와 농산물의 장터.',1309907],
    ['goesan-market','괴산전통시장','충북 · 괴산','central',36.811142,127.795010,'괴산군 괴산읍 읍내로15길 8-8','고추와 산채, 농촌의 식재료가 모이는 곳.',132010],
    ['uljin-market','울진바지게시장','경북 · 울진','central',36.996,129.403,'울진군 울진읍 읍내1길 18','바다 먹거리와 농산물이 만나는 장터.','https://access.visitkorea.or.kr/ms/detail.do?cotId=acfaa3d5-f586-489b-9921-47c49a590b0e'],
    ['yeongdeok-market','영덕시장','경북 · 영덕','south',36.406751,129.369746,'영덕군 영덕읍 남석길 23-48','미주구리와 제철 수산물로 만나는 영덕.',132283],
    ['gampo-market','감포공설시장','경북 · 경주','south',35.804153,129.502046,'경주시 감포읍 감포로 115','참가자미와 돌미역, 감포 항구의 맛.',2756602],
    ['yeongju-market','영주365시장','경북 · 영주','central',36.8255,128.6228,'영주시 구성로360번길 2-1','영주문어와 부침개, 반찬 골목을 걷다.','https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=27785662-4191-4546-8a06-7e444bae41c9'],
    ['andong-market','안동구시장','경북 · 안동','south',36.565563,128.728373,'안동시 번영길 21','찜닭 골목에서 만나는 안동의 한 끼.',132282],
    ['gongju-market','공주산성시장','충남 · 공주','west',36.458849,127.122622,'공주시 용당길 22','밤과자와 시장 음식, 공주의 작은 골목.',2613453],
    ['yesan-market','예산시장','충남 · 예산','west',36.677022,126.849685,'예산군 예산읍 예산시장길 2','한 자리에서 둘러보는 예산의 먹거리.',132260],
    ['hongseong-market','홍성전통시장','충남 · 홍성','west',36.602199,126.668037,'홍성군 홍성읍 홍성천길 242','농촌의 제철 채소와 먹거리가 모이는 곳.',2771854],
    ['gwangcheon-market','광천전통시장','충남 · 홍성','west',36.500677,126.624971,'홍성군 광천읍 광천로285번길 8-16','토굴새우젓과 광천김을 찾아가는 장터.',132042],
    ['daecheon-market','대천항수산시장','충남 · 보령','west',36.326503,126.508867,'보령시 대천항로 334','서해에 도착해 만나는 보령의 해산물.',2750901]
  ];
  marketRows.forEach(([id,name,region,corridor,lat,lng,address,lead,source])=>places.push({id,name,region,corridor,lat,lng,address,lead,source:typeof source==='number'?tourism(source):source,kind:'spot',category:'food',description:lead+' 시장 골목은 바이크를 세우고 걸어서 둘러보세요. 주변 상점에서 식사하거나 지역 식재료를 고르며 잠시 쉬어갈 수 있습니다.',note:'장날과 점포별 영업일을 확인하세요. 시장 밖 공용 주차 구역을 이용하고 보행자 통행을 우선합니다.',coordinateAccuracy:'approximate',image:'',reuseStatus:'unverified'}));
  const sights=[
    ['nongol','논골담길','강원 · 동해','north',37.552221,129.118339,'동해시 일출로 97','항구 위 골목에서 내려다보는 묵호 바다.',1223212,'culture'],
    ['jukseoru','죽서루','강원 · 삼척','north',37.441104,129.161241,'삼척시 죽서루길 37','오십천 절벽 위 누각에서 쉬어가는 시간.',125799,'culture'],
    ['heonhwa','헌화로','강원 · 강릉','north',37.663465,129.054816,'강릉시 강동면 심곡리 162','바다와 바위 사이로 이어지는 해안길.',2714722,'nature'],
    ['jangho','장호해변','강원 · 삼척','north',37.28595,129.31423,'삼척시 근덕면 장호리','작은 항구와 맑은 바다가 나란히 있는 곳.',125711,'nature'],
    ['seongryu','성류굴','경북 · 울진','central',36.961,129.381,'울진군 근남면 성류굴로 221','왕피천 곁에서 만나는 석회암 동굴.',126113,'nature'],
    ['jusanji','주산지','경북 · 청송','south',36.362767,129.189852,'청송군 주왕산면 주산지리','물에 잠긴 나무와 산그림자를 만나는 산책.',126223,'nature'],
    ['buseok-seosan','서산 부석사','충남 · 서산','west',36.703528,126.412446,'서산시 부석면 부석사길 243','도비산 자락의 조용한 절집.',125879,'culture'],
    ['sindolseok','신돌석장군 유적지','경북 · 영덕','south',36.519417,129.403939,'영덕군 축산면 신돌석장군길 218','영덕의 의병 역사를 돌아보는 짧은 정차.',127227,'culture'],
    ['dansan','소백산단산 포도마을','경북 · 영주','central',36.947631,128.61628,'영주시 단산면 단산로 817','소백산 아래 과수원과 마을 풍경.',547880,'culture'],
    ['geojosa','거조사','경북 · 영천','south',36.020134,128.764605,'영천시 청통면 거조길 400-67','산자락에서 만나는 오래된 목조건축.',2758318,'culture'],
    ['hupo','후포방파제','경북 · 울진','central',36.677622,129.461999,'울진군 후포면 울진대게로 236-26','어선이 드나드는 후포항의 일상.',131276,'nature'],
    ['rest-garden','쉼이있는정원','충남 · 서산','west',36.726064,126.426194,'서산시 인지면 모월2길 111-5','서해로 향하는 길에 걷는 작은 정원.',3046071,'nature'],
    ['baeron','배론성지','충북 · 제천','north',37.161216,128.083794,'제천시 봉양읍 배론성지길 296','골짜기에 자리한 성지의 고요한 산책길.',125982,'culture'],
    ['sainam','사인암','충북 · 단양','north',36.895123,128.341126,'단양군 대강면 사인암2길 42','물가에 우뚝 선 암벽을 바라보는 쉼.',129648,'nature'],
    ['uirim-museum','의림지 역사박물관','충북 · 제천','north',37.176155,128.209488,'제천시 의림대로47길 7','오래된 저수지와 제천의 이야기를 함께.',2638587,'culture'],
    ['uirim-forest','의림지 솔밭공원','충북 · 제천','north',37.183352,128.205224,'제천시 모산동','소나무 그늘 아래서 잠시 다리를 풀어보세요.',2751857,'nature'],
    ['sangseonam','상선암','충북 · 단양','north',36.872231,128.290739,'단양군 선암계곡로 790','계곡을 따라 이어지는 단양의 바위 풍경.',1627287,'nature'],
    ['jiyong','정지용 생가','충북 · 옥천','south',36.315073,127.582165,'옥천군 옥천읍 향수길 56','시인의 고향에서 걷는 옥천 구읍.',127281,'culture'],
    ['hwayang','화양구곡','충북 · 괴산','central',36.668437,127.812793,'괴산군 청천면 화양동길 202','계곡과 숲을 따라 천천히 걷는 길.',1940709,'nature'],
    ['ojanghwan','오장환문학관','충북 · 보은','central',36.493036,127.596212,'보은군 회인면 회인로5길 12','작은 마을에서 만나는 시와 삶의 흔적.',1940652,'culture'],
    ['gongsanseong','공산성','충남 · 공주','west',36.462998,127.126808,'공주시 웅진로 280','금강을 내려다보며 걷는 백제의 성곽.',125949,'culture'],
    ['oeam','외암민속마을','충남 · 아산','west',36.73104,127.014447,'아산시 송악면 외암민속길9번길 13-2','돌담과 고택 사이로 이어지는 마을길.',126001,'culture'],
    ['ganwolam','간월암','충남 · 서산','west',36.603836,126.411421,'서산시 부석면 간월도1길 119-29','물때에 따라 길이 열리는 바닷가 암자.',125880,'culture'],
    ['sudeoksa','수덕사','충남 · 예산','west',36.663,126.623,'예산군 덕산면 수덕사안길 79','덕숭산 아래 목조건축과 숲길.','https://www.chungnam.net/cnpark/main/contents.do?menuNo=3300021','culture'],
    ['gungnamji','궁남지','충남 · 부여','west',36.269,126.912,'부여군 부여읍 궁남로 52','연못을 따라 부여의 바람을 느끼는 산책.','https://www.buyeo.go.kr/html/tour/opentour/useful/useinfo.html','nature'],
    ['muryangsa','무량사','충남 · 부여','west',36.318,126.697,'부여군 외산면 무량로 203','산길 끝에서 만나는 고요한 절집.','https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=77012','culture'],
    ['muchangpo','무창포해수욕장','충남 · 보령','west',36.246,126.535,'보령시 웅천읍 열린바다1길 10','대천 남쪽에서 잠시 만나는 서해 모래사장.','https://tour.chungnam.go.kr/prog/trsrcn/kor/sub02_01_02/view.do?trsrcnNo=56','nature'],
    ['haemi','해미읍성','충남 · 서산','west',36.713,126.549,'서산시 해미면 남문2로 143','성문을 지나 넓은 잔디와 돌담을 걷다.','https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=faf7696c-ca1c-4848-bc6b-ba77bc0c96c8','culture'],
    ['sosu','소수서원','경북 · 영주','central',36.925,128.580,'영주시 순흥면 소백로 2740','소나무와 물길 곁에 자리한 서원.','https://www.yeongju.go.kr/open_content/sosuseowon/page.do?mnu_uid=3346','culture'],
    ['buseok-yeongju','영주 부석사','경북 · 영주','central',36.999,128.688,'영주시 부석면 부석사로 345','계단을 오르며 겹겹의 산을 바라보는 곳.','https://www.kh.or.kr/visit/kor/road/4/view.do?key=2408220004','culture']
  ];
  sights.forEach(([id,name,region,corridor,lat,lng,address,lead,source,category])=>places.push({id,name,region,corridor,lat,lng,address,lead,source:typeof source==='number'?tourism(source):source,kind:'spot',category,description:lead+' 바이크는 지정된 주차 공간에 세우고 둘러보세요. 산책이나 관람에 필요한 시간을 고려해 다음 목적지까지의 일정을 잡으면 좋습니다.',note:'개방 시간과 입장 조건을 확인하세요. 도로변 임의 정차는 피하고, 해안 장소는 날씨와 물때에 유의하세요.',coordinateAccuracy:'approximate',image:'',reuseStatus:'unverified'}));
  const southernRows=[
    ["oryukdo-skywalk","오륙도 스카이워크","부산 · 남구","south",35.100572,129.124731,"부산 남구 오륙도 스카이워크 일대","바다 위 전망 데크에서 오륙도와 부산 해안을 바라봅니다.","https://www.openstreetmap.org/node/4197185189","nature","https://upload.wikimedia.org/wikipedia/commons/5/52/Oryukdo_Skywalk_in_Busan%2C_South_Korea.jpg","Wikimedia Commons · Choi2451 · CC0","https://commons.wikimedia.org/wiki/File:Oryukdo_Skywalk_in_Busan,_South_Korea.jpg","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["gamcheon","감천문화마을","부산 · 사하","south",35.096337,129.00879,"부산 사하 감천문화마을 일대","산비탈의 골목과 색색의 집들을 걸어봅니다.","https://www.openstreetmap.org/way/382693934","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Gamcheon_Colored_Houses%2C_Busan%2C_Korea.jpg/960px-Gamcheon_Colored_Houses%2C_Busan%2C_Korea.jpg","Wikimedia Commons · Ken Eckert · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Gamcheon_Colored_Houses,_Busan,_Korea.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["huinnyeoul","흰여울문화마을","부산 · 영도","south",35.077396,129.045651,"부산 영도 흰여울문화마을 일대","절벽 위 마을길에서 영도 앞바다를 만납니다.","https://www.openstreetmap.org/node/5450264422","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Huinnyeoul_culture_village%2C_Busan_on_October_25th%2C_2019.jpg/960px-Huinnyeoul_culture_village%2C_Busan_on_October_25th%2C_2019.jpg","Wikimedia Commons · Choi2451 · CC0","https://commons.wikimedia.org/wiki/File:Huinnyeoul_culture_village,_Busan_on_October_25th,_2019.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["eulsukdo","을숙도","부산 · 사하","south",35.101941,128.940933,"부산 사하 을숙도 일대","낙동강 하구의 넓은 하늘과 습지를 둘러봅니다.","https://www.openstreetmap.org/relation/11827254","nature","https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Saha-gu_eulsuk-do.jpg/960px-Saha-gu_eulsuk-do.jpg","Wikimedia Commons · FriedC · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Saha-gu_eulsuk-do.jpg","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["suro-tomb","수로왕릉","경남 · 김해","south",35.232843,128.872099,"경남 김해 수로왕릉 일대","가야의 흔적이 남은 김해 도심의 왕릉을 찾습니다.","https://www.openstreetmap.org/node/5208433895","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Suro_Tomb.JPG/960px-Suro_Tomb.JPG","Wikimedia Commons · 이 그림은 Kwj2772의 저작물입니다. · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Suro_Tomb.JPG","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["bongha","봉하마을","경남 · 김해","south",35.314205,128.770376,"경남 김해 봉하마을 일대","봉하마을의 들판과 마을길을 천천히 걸어봅니다.","https://www.openstreetmap.org/way/557341224","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Roh_Moo-hyun%27s_House.jpg/960px-Roh_Moo-hyun%27s_House.jpg","Wikimedia Commons · G43 · CC BY 3.0","https://commons.wikimedia.org/wiki/File:Roh_Moo-hyun%27s_House.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["tongdosa","통도사","경남 · 양산","south",35.48786,129.06429,"경남 양산 통도사 일대","영축산 자락의 통도사에서 산사의 시간을 보냅니다.","https://www.openstreetmap.org/way/472095264","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Korea-Tongdosa-09.jpg/960px-Korea-Tongdosa-09.jpg","Wikimedia Commons · Steve46814 (talk) · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Korea-Tongdosa-09.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["yeongnamru","영남루","경남 · 밀양","south",35.491485,128.753914,"경남 밀양 영남루 일대","밀양강을 내려다보는 누각에 잠시 머뭅니다.","https://www.openstreetmap.org/node/9357623939","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/Yeongnamru_Miryang_Gyeongsangnamdo.JPG/960px-Yeongnamru_Miryang_Gyeongsangnamdo.JPG","Wikimedia Commons · Maru4u · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Yeongnamru_Miryang_Gyeongsangnamdo.JPG","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["pyochungsa","표충사","경남 · 밀양","south",35.532849,128.959437,"경남 밀양 표충사 일대","재약산 기슭의 사찰에서 숲길을 걷습니다.","https://www.openstreetmap.org/way/660266782","culture","https://upload.wikimedia.org/wikipedia/commons/a/a4/Miryang_Pyochungsa.png","Wikimedia Commons · Roadgo · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Miryang_Pyochungsa.png","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["upo-wetland","우포늪","경남 · 창녕","south",35.553021,128.414823,"경남 창녕 우포늪 일대","늪과 탐방로가 만나는 창녕의 물가에 섭니다.","https://www.openstreetmap.org/way/37220944","nature","https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/%EC%9A%B0%ED%8F%AC%EB%8A%AA_%ED%92%8D%EA%B2%BD_%28Upo_wetlands_scenery%29.jpg/960px-%EC%9A%B0%ED%8F%AC%EB%8A%AA_%ED%92%8D%EA%B2%BD_%28Upo_wetlands_scenery%29.jpg","Wikimedia Commons · Travel in Korea · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:%EC%9A%B0%ED%8F%AC%EB%8A%AA_%ED%92%8D%EA%B2%BD_(Upo_wetlands_scenery).jpg","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["hwawangsan","화왕산","경남 · 창녕","south",35.547148,128.531694,"경남 창녕 화왕산 일대","창녕 들판 위 화왕산의 산세를 바라봅니다.","https://www.openstreetmap.org/node/5382414737","nature","https://upload.wikimedia.org/wikipedia/commons/9/94/Changnyeong_Hwawangsan_wide.jpg","Wikimedia Commons · Taken by User:Visviva and released into the public · Public domain","https://commons.wikimedia.org/wiki/File:Changnyeong_Hwawangsan_wide.jpg","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["junam-reservoir","주남저수지","경남 · 창원","south",35.318238,128.675278,"경남 창원 주남저수지 일대","철새가 머무는 저수지 주변에서 쉬어갑니다.","https://www.openstreetmap.org/way/570612318","nature","","","","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["jinjuseong","진주성","경남 · 진주","south",35.188817,128.077604,"경남 진주 진주성 일대","남강을 따라 이어진 성곽길을 걸어봅니다.","https://www.openstreetmap.org/way/560496516","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/Jinju_castle-Chosuk_gate.jpg/960px-Jinju_castle-Chosuk_gate.jpg","Wikimedia Commons · Kang Byeong Kee · CC BY 3.0","https://commons.wikimedia.org/wiki/File:Jinju_castle-Chosuk_gate.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["samcheonpo-bridge","삼천포대교","경남 · 사천","south",34.928492,128.050529,"경남 사천 삼천포대교 일대","섬과 섬을 잇는 다리의 남해 풍경을 만납니다.","https://www.openstreetmap.org/way/1450915418","nature","https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Changsun_Sachunpo_Bridge.JPG/960px-Changsun_Sachunpo_Bridge.JPG","Wikimedia Commons · Woohyong · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Changsun_Sachunpo_Bridge.JPG","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["choechampan-house","최참판댁","경남 · 하동","south",35.155552,127.688086,"경남 하동 최참판댁 일대","하동 평사리의 한옥과 들판을 둘러봅니다.","https://www.openstreetmap.org/way/796155653","culture","https://upload.wikimedia.org/wikipedia/commons/5/5e/%EC%B5%9C%EC%B0%B8%ED%8C%90%EB%8C%81_%EC%82%AC%EB%9E%91%EC%B1%84.jpg","Wikimedia Commons · Gcd822 · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:%EC%B5%9C%EC%B0%B8%ED%8C%90%EB%8C%81_%EC%82%AC%EB%9E%91%EC%B1%84.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["hwagae-market","화개장터","경남 · 하동","south",35.188379,127.62428,"경남 하동 화개장터 일대","섬진강 길목의 장터에서 식사와 휴식을 챙깁니다.","https://www.openstreetmap.org/way/107976013","food","https://commons.wikimedia.org/wiki/Special:FilePath/Korea-Hadong-Hwagae.jangteo-Market-01.jpg?width=960","Wikimedia Commons · eimoberg · CC BY 2.0","https://commons.wikimedia.org/wiki/File:Korea-Hadong-Hwagae.jangteo-Market-01.jpg","장날과 영업 시간, 주차 가능 구역을 방문 전 확인하세요."],
    ["donguibogam-village","동의보감촌","경남 · 산청","south",35.439308,127.828055,"경남 산청 동의보감촌 일대","산청의 한방 문화 공간을 산책합니다.","https://www.openstreetmap.org/way/1217000590","culture","https://commons.wikimedia.org/wiki/Special:FilePath/Sancheong%20Gun%2051%20%2816666146226%29.jpg?width=960","Wikimedia Commons · Jeon Han / Korea.net · CC BY-SA 2.0","https://commons.wikimedia.org/wiki/File:Sancheong_Gun_51_%2816666146226%29.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["sangnim-forest","상림공원","경남 · 함양","south",35.527705,127.717528,"경남 함양 상림공원 일대","함양 읍내의 오래된 숲에서 그늘을 찾습니다.","https://www.openstreetmap.org/way/162207743","nature","https://commons.wikimedia.org/wiki/Special:FilePath/Hamyang%20Sangrim.JPG?width=960","Wikimedia Commons · HappyMidnight · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Hamyang_Sangrim.JPG","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["suseungdae","수승대","경남 · 거창","south",35.759781,127.834467,"경남 거창 수승대 일대","계곡을 따라 이어지는 거창의 바위와 물길을 봅니다.","https://www.openstreetmap.org/node/465212080","nature","https://commons.wikimedia.org/wiki/Special:FilePath/Suseungdae2.jpg?width=960","Wikimedia Commons · Dittwjfsdgkvkdjg · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Suseungdae2.jpg","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["dongpirang","동피랑","경남 · 통영","south",34.845669,128.427728,"경남 통영 동피랑 일대","통영 언덕의 골목과 항구 풍경을 걸어서 만납니다.","https://www.openstreetmap.org/node/7160198785","culture","https://upload.wikimedia.org/wikipedia/commons/1/12/Korea-Tongyeong-Dongpirang_Village-10.jpg","Wikimedia Commons · by Junho Jung at Flickr from South Korea · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Korea-Tongyeong-Dongpirang_Village-10.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["aviation-museum","항공우주박물관","경남 · 사천","south",35.071683,128.063193,"경남 사천 항공우주박물관 일대","사천의 항공 전시 공간을 둘러봅니다.","https://www.openstreetmap.org/way/56181022","culture","","","","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["sangjogam","상족암","경남 · 고성","south",34.904498,128.151436,"경남 고성 상족암 일대","해안 절벽의 층층이 쌓인 암석을 가까이서 봅니다.","https://www.openstreetmap.org/node/8625411712","nature","","","","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["hwaeomsa","화엄사","전남 · 구례","south",35.25733,127.497429,"전남 구례 화엄사 일대","지리산 기슭의 사찰에서 잠시 걸음을 늦춥니다.","https://www.openstreetmap.org/node/11652032600","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/%ED%99%94%EC%97%84%EC%82%AC3.jpg/960px-%ED%99%94%EC%97%84%EC%82%AC3.jpg","Wikimedia Commons · (c)한국불교문화사업단, culturalcorpsofkoreanbuddhism · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:%ED%99%94%EC%97%84%EC%82%AC3.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["maehwa-village","매화마을","전남 · 광양","south",35.078223,127.717456,"전남 광양 매화마을 일대","섬진강 곁 매화마을의 길과 들판을 만납니다.","https://www.openstreetmap.org/node/11621716173","nature","https://commons.wikimedia.org/wiki/Special:FilePath/Gwangyang%20Maehwa%20Festival%20in%20Spring%20-%204403554912.jpg?width=960","Wikimedia Commons · Korea.net · CC BY-SA 2.0","https://commons.wikimedia.org/wiki/File:Gwangyang_Maehwa_Festival_in_Spring_-_4403554912.jpg","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["gubongsan-observatory","구봉산전망대","전남 · 광양","south",34.939495,127.637726,"전남 광양 구봉산전망대 일대","광양만을 내려다보는 전망대에서 경로를 돌아봅니다.","https://www.openstreetmap.org/way/697143173","nature","","","","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["naganeupseong","낙안읍성","전남 · 순천","south",34.905898,127.343175,"전남 순천 낙안읍성 일대","성벽 안쪽의 마을길을 걸으며 순천의 시간을 봅니다.","https://www.openstreetmap.org/node/9037095176","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/%EB%82%99%EC%95%88%EC%9D%8D%EC%84%B1%EC%A0%84%EA%B2%BD.jpg/960px-%EB%82%99%EC%95%88%EC%9D%8D%EC%84%B1%EC%A0%84%EA%B2%BD.jpg","Wikimedia Commons · Minquddyd · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:%EB%82%99%EC%95%88%EC%9D%8D%EC%84%B1%EC%A0%84%EA%B2%BD.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["suncheon-bay","순천만습지","전남 · 순천","south",34.886679,127.507746,"전남 순천 순천만습지 일대","순천만 갈대밭과 습지 탐방로를 걷습니다.","https://www.openstreetmap.org/node/4774136921","nature","https://commons.wikimedia.org/wiki/Special:FilePath/Suncheon%20Ecological%20Bay-%20%EC%88%9C%EC%B2%9C%EB%A7%8C%EC%8A%B5%EC%A7%80.jpg?width=960","Wikimedia Commons · Joycekim77 · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Suncheon_Ecological_Bay-_%EC%88%9C%EC%B2%9C%EB%A7%8C%EC%8A%B5%EC%A7%80.jpg","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["daehan-dawon","대한다원","전남 · 보성","south",34.715847,127.07796,"전남 보성 대한다원 일대","보성의 차밭 능선을 따라 풍경을 둘러봅니다.","https://www.openstreetmap.org/way/257727324","nature","https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/%EB%8C%80%ED%95%9C%EB%8B%A4%EC%9B%90_%EC%B0%A8%EB%B0%AD.JPG/960px-%EB%8C%80%ED%95%9C%EB%8B%A4%EC%9B%90_%EC%B0%A8%EB%B0%AD.JPG","Wikimedia Commons · Jocelyndurrey · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:%EB%8C%80%ED%95%9C%EB%8B%A4%EC%9B%90_%EC%B0%A8%EB%B0%AD.JPG","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["juknokwon","죽녹원","전남 · 담양","south",35.318032,126.975536,"전남 담양 죽녹원 일대","담양 대숲의 그늘에서 짧은 산책을 즐깁니다.","https://www.openstreetmap.org/way/1490611901","nature","https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Damyang_Jungnogwon_%281%29.jpg/960px-Damyang_Jungnogwon_%281%29.jpg","Wikimedia Commons · Christian Bolz (크리스티안 볼츠) · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Damyang_Jungnogwon_(1).jpg","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["unjusa","운주사","전남 · 화순","south",34.92552,126.880138,"전남 화순 운주사 일대","운주사의 석불과 석탑을 천천히 살펴봅니다.","https://www.openstreetmap.org/node/11968443170","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/Korea-Unjusa_4507-07_Cilcheung_Seoktap_facing_Unjusa_Seokjo_Bulgam.JPG/960px-Korea-Unjusa_4507-07_Cilcheung_Seoktap_facing_Unjusa_Seokjo_Bulgam.JPG","Wikimedia Commons · Steve46814 · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Korea-Unjusa_4507-07_Cilcheung_Seoktap_facing_Unjusa_Seokjo_Bulgam.JPG","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["geumseonggwan","금성관","전남 · 나주","south",35.032736,126.716789,"전남 나주 금성관 일대","나주 읍성 안쪽의 옛 관아 건물을 찾습니다.","https://www.openstreetmap.org/way/540205109","culture","https://commons.wikimedia.org/wiki/Special:FilePath/%EB%82%98%EC%A3%BC%EA%B8%88%EC%84%B1%EA%B4%80.jpg?width=960","Wikimedia Commons · Kyklyj · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:%EB%82%98%EC%A3%BC%EA%B8%88%EC%84%B1%EA%B4%80.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["dasan-chodang","다산초당","전남 · 강진","south",34.580776,126.745038,"전남 강진 다산초당 일대","강진의 다산초당까지 숲길을 걸어봅니다.","https://www.openstreetmap.org/node/12944873804","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Dasanchodang_%28%E8%8C%B6%E5%B1%B1%E8%8D%89%E5%A0%82%29_-_panoramio.jpg/960px-Dasanchodang_%28%E8%8C%B6%E5%B1%B1%E8%8D%89%E5%A0%82%29_-_panoramio.jpg","Wikimedia Commons · Cho's · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Dasanchodang_(%E8%8C%B6%E5%B1%B1%E8%8D%89%E5%A0%82)_-_panoramio.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["seonamsa","선암사","전남 · 순천","south",34.996884,127.330933,"전남 순천 선암사 일대","조계산 자락의 산사에서 숲과 건축을 만납니다.","https://www.openstreetmap.org/way/223223743","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Seonamsa_Iljumun_11-06782.JPG/960px-Seonamsa_Iljumun_11-06782.JPG","Wikimedia Commons · Steve46814 · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Seonamsa_Iljumun_11-06782.JPG","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["soswaewon","소쇄원","전남 · 담양","south",35.183628,127.012178,"전남 담양 소쇄원 일대","담양 별서 정원의 담장과 물길을 둘러봅니다.","https://www.openstreetmap.org/way/623246372","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/KOCIS_Korea_Soswaewon_01_%287581350982%29.jpg/960px-KOCIS_Korea_Soswaewon_01_%287581350982%29.jpg","Wikimedia Commons · 코리아넷 / 해외문화홍보원 (전한) · CC BY-SA 2.0","https://commons.wikimedia.org/wiki/File:KOCIS_Korea_Soswaewon_01_(7581350982).jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["hwasun-red-cliff","화순적벽","전남 · 화순","south",35.103425,127.087624,"전남 화순 화순적벽 일대","화순의 절벽과 물길을 전망 가능한 곳에서 봅니다.","https://www.openstreetmap.org/node/5188303121","nature","","","","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["gwanghallu","광한루원","전북 · 남원","south",35.402798,127.379539,"전북 남원 광한루원 일대","광한루와 연못을 따라 남원 도심을 걷습니다.","https://www.openstreetmap.org/relation/7802098","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Korea-Nawon-Kwanghanlu2.jpg/960px-Korea-Nawon-Kwanghanlu2.jpg","Wikimedia Commons · Asfreeas · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Korea-Nawon-Kwanghanlu2.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["honbul-museum","혼불문학관","전북 · 남원","south",35.480715,127.320102,"전북 남원 혼불문학관 일대","소설 혼불의 이야기를 남원에서 만납니다.","https://www.openstreetmap.org/way/1317549008","culture","https://upload.wikimedia.org/wikipedia/commons/6/6b/%ED%98%BC%EB%B6%88%EB%AC%B8%ED%95%99%EA%B4%80.jpg","Wikimedia Commons · 이충재-PHOTO SALON · CC BY 3.0","https://commons.wikimedia.org/wiki/File:%ED%98%BC%EB%B6%88%EB%AC%B8%ED%95%99%EA%B4%80.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["gangcheonsan","강천산","전북 · 순창","south",35.40192,127.04838,"전북 순창 강천산 일대","순창의 계곡과 산길을 바라보며 쉬어갑니다.","https://www.openstreetmap.org/node/5368979882","nature","","","","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["okjeongho","옥정호","전북 · 임실","south",35.596187,127.111958,"전북 임실 옥정호 일대","옥정호 물가에서 임실의 산과 호수를 봅니다.","https://www.openstreetmap.org/relation/5614945","nature","https://commons.wikimedia.org/wiki/Special:FilePath/Okjeongho%20From%20Hoemunsan%202005.jpg?width=960","Wikimedia Commons · Lee Seung-Cheol · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Okjeongho_From_Hoemunsan_2005.jpg","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["jeonju-hanok","전주한옥마을","전북 · 전주","south",35.818183,127.153042,"전북 전주 전주한옥마을 일대","전주 골목길에서 한옥과 지역의 음식을 만납니다.","https://www.openstreetmap.org/way/569532829","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/%EC%A0%84%EC%A3%BC%ED%95%9C%EC%98%A5%EB%A7%88%EC%9D%84_%EC%A0%84%EA%B2%BD.JPG/960px-%EC%A0%84%EC%A3%BC%ED%95%9C%EC%98%A5%EB%A7%88%EC%9D%84_%EC%A0%84%EA%B2%BD.JPG","Wikimedia Commons · Songk1122 · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:%EC%A0%84%EC%A3%BC%ED%95%9C%EC%98%A5%EB%A7%88%EC%9D%84_%EC%A0%84%EA%B2%BD.JPG","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["gyeonggijeon","경기전","전북 · 전주","south",35.815657,127.149796,"전북 전주 경기전 일대","태조 어진을 모신 경기전의 뜰을 걷습니다.","https://www.openstreetmap.org/way/36524723","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/%EC%A0%84%EC%A3%BC_%EA%B2%BD%EA%B8%B0%EC%A0%84_%ED%99%8D%EC%82%B4%EB%AC%B8_1.jpg/960px-%EC%A0%84%EC%A3%BC_%EA%B2%BD%EA%B8%B0%EC%A0%84_%ED%99%8D%EC%82%B4%EB%AC%B8_1.jpg","Wikimedia Commons · Motoko C. K. · CC BY 4.0","https://commons.wikimedia.org/wiki/File:%EC%A0%84%EC%A3%BC_%EA%B2%BD%EA%B8%B0%EC%A0%84_%ED%99%8D%EC%82%B4%EB%AC%B8_1.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["seonunsa","선운사","전북 · 고창","south",35.496907,126.578472,"전북 고창 선운사 일대","고창 선운산 자락의 사찰을 둘러봅니다.","https://www.openstreetmap.org/node/368861685","culture","https://upload.wikimedia.org/wikipedia/commons/1/16/%EC%84%A0%EC%9A%B4%EC%82%AC_%EC%9D%BC%EC%A3%BC%EB%AC%B8.jpeg","Wikimedia Commons · 나랑드 · CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:%EC%84%A0%EC%9A%B4%EC%82%AC_%EC%9D%BC%EC%A3%BC%EB%AC%B8.jpeg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["gochang-fortress","고창읍성","전북 · 고창","west",35.429564,126.704801,"전북 고창 고창읍성 일대","고창읍성의 성벽을 따라 마을을 바라봅니다.","https://www.openstreetmap.org/way/108290543","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/%EA%B3%A0%EC%B0%BD%EC%9D%8D%EC%84%B1%EC%9D%98_%EB%B4%84.jpg/960px-%EA%B3%A0%EC%B0%BD%EC%9D%8D%EC%84%B1%EC%9D%98_%EB%B4%84.jpg","Wikimedia Commons · Leeyoungbum · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:%EA%B3%A0%EC%B0%BD%EC%9D%8D%EC%84%B1%EC%9D%98_%EB%B4%84.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["chaeseokgang","채석강","전북 · 부안","west",35.627036,126.468178,"전북 부안 채석강 일대","변산 해안의 층리 절벽을 가까이서 만납니다.","https://www.openstreetmap.org/node/391267478","nature","https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Korea-Buan_County-Chaeseokgang-01.jpg/960px-Korea-Buan_County-Chaeseokgang-01.jpg","Wikimedia Commons · Byungjoon Kim · CC BY 2.0","https://commons.wikimedia.org/wiki/File:Korea-Buan_County-Chaeseokgang-01.jpg","도로변 임의 정차를 피하고 지정 주차 구역과 날씨를 확인하세요."],
    ["gunsan-history","군산근대역사박물관","전북 · 군산","west",35.990814,126.712203,"전북 군산 군산근대역사박물관 일대","군산의 근대 항구 역사를 전시관에서 살펴봅니다.","https://www.openstreetmap.org/relation/11564073","culture","https://upload.wikimedia.org/wikipedia/commons/6/6a/Entrance_of_Gunsan_Modern_History_Museum.jpg","Wikimedia Commons · Dquai · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Entrance_of_Gunsan_Modern_History_Museum.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["byeokgolje","벽골제","전북 · 김제","west",35.753693,126.853502,"전북 김제 벽골제 일대","김제 들판에 남은 오래된 저수지 유적을 봅니다.","https://www.openstreetmap.org/way/110177156","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/%EB%B2%BD%EA%B3%A8%EC%A0%9C.jpg/960px-%EB%B2%BD%EA%B3%A8%EC%A0%9C.jpg","Wikimedia Commons · Kyklyj · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:%EB%B2%BD%EA%B3%A8%EC%A0%9C.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["naesosa","내소사","전북 · 부안","west",35.617518,126.587251,"전북 부안 내소사 일대","전나무길을 지나 부안 내소사로 걸어갑니다.","https://www.openstreetmap.org/way/112654510","culture","https://upload.wikimedia.org/wikipedia/commons/f/f5/%EB%82%B4%EC%86%8C%EC%82%AC4.jpg","Wikimedia Commons · (c)한국불교문화사업단, culturalcorpsofkoreanbuddhism · CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:%EB%82%B4%EC%86%8C%EC%82%AC4.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["mireuksa","미륵사지","전북 · 익산","west",36.012402,127.030572,"전북 익산 미륵사지 일대","익산 미륵사지의 석탑과 터를 둘러봅니다.","https://www.openstreetmap.org/way/875685222","culture","https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/%EC%9D%B5%EC%82%B0_%EB%AF%B8%EB%A5%B5%EC%82%AC%EC%A7%80_%EC%84%9D%ED%83%91%282019%EB%85%84%29_%EC%95%BC%EA%B2%BD.jpg/960px-%EC%9D%B5%EC%82%B0_%EB%AF%B8%EB%A5%B5%EC%82%AC%EC%A7%80_%EC%84%9D%ED%83%91%282019%EB%85%84%29_%EC%95%BC%EA%B2%BD.jpg","Wikimedia Commons · 미상Unknown author · KOGL Type 1","https://commons.wikimedia.org/wiki/File:%EC%9D%B5%EC%82%B0_%EB%AF%B8%EB%A5%B5%EC%82%AC%EC%A7%80_%EC%84%9D%ED%83%91(2019%EB%85%84)_%EC%95%BC%EA%B2%BD.jpg","주차 가능한 곳에 바이크를 세우고 도보로 둘러보세요. 개방 여부를 방문 전 확인하세요."],
    ["jinju-market","진주중앙시장","경남 · 진주","south",35.194685,128.085216,"경남 진주 진주중앙시장 일대","진주 도심 장터에서 식사와 물을 보충합니다.","https://www.openstreetmap.org/way/458953470","food","","","","장날과 영업 시간, 주차 가능 구역을 방문 전 확인하세요."],
    ["damyang-market","담양시장","전남 · 담양","south",35.322598,126.980536,"전남 담양 담양시장 일대","담양 장터에서 남부 구간의 한 끼를 고릅니다.","https://www.openstreetmap.org/way/597198294","food","","","","장날과 영업 시간, 주차 가능 구역을 방문 전 확인하세요."]
  ];
  southernRows.forEach(([id,name,region,corridor,lat,lng,address,lead,source,category,image,photoCredit,photoSource,note])=>places.push({id,name,region,corridor,lat,lng,address,lead,source,category,image,photoCredit,photoSource,note,kind:'spot',description:lead+' 경유 후보로 살펴보고, 바이크는 허용된 주차 구역에 세워 주세요.',coordinateAccuracy:'approximate',photoKind:image?'PLACE_PHOTO':undefined,reuseStatus:'unverified'}));
  const photos={
  "the-road-1423": "https://www.mbzine.com/wp-content/uploads/2023/03/2303_life_cafe5-2.jpg",
  "allride": "https://www.mbzine.com/wp-content/uploads/2023/03/2303_life_cafe2-2-2.jpg",
  "bikongs": "https://www.mbzine.com/wp-content/uploads/2023/07/2307_place_bikongs_main.jpg",
  "harleywood": "https://cdn.imweb.me/upload/S2020112077da751d9e507/515b293324ca4.jpg",
  "road-runner": {
    "image": "/web/app/assets/spots/road-runner.webp",
    "photoSource": "https://www.reitwagen.co.kr/posts/2147",
    "photoOriginalUrl": "https://reitwagen-cdn.baree.net/3_03c86a62e9.jpeg",
    "photoCredit": "사진 · 라이트바겐",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "gangneung-market": "66/3495766_image2_1.jpg",
  "donghae-market": "02/3491802_image2_1.JPG",
  "bukpyeong-market": "70/2741970_image2_1.jpg",
  "jeongseon-market": "62/2733762_image2_1.jpg",
  "gongju-market": "45/2393745_image2_1.jpg",
  "yesan-market": "19/3039719_image2_1.jpg",
  "daecheon-market": "67/2751167_image2_1.jpg",
  "nongol": "25/1220425_image2_1.jpg",
  "sindolseok": "50/201850_image2_1.jpg",
  "hupo": "72/3065172_image2_1.JPG",
  "sainam": "55/2917855_image2_1.jpg",
  "uirim-museum": "02/3416202_image2_1.jpg",
  "hwayang": "56/1848556_image2_1.jpg",
  "gongsanseong": "68/2678668_image2_1.jpg",
  "andong-market": {
    "image": "/web/app/assets/spots/andong-market.webp",
    "photoSource": "https://www.tripinfo.co.kr/info.html?content_id=132282&content_type_id=38",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/19/1802319_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "baeron": {
    "image": "/web/app/assets/spots/baeron.webp",
    "photoSource": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=75548",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/49/2026149_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "bongpyeong-market": {
    "image": "/web/app/assets/spots/bongpyeong-market.webp",
    "photoSource": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=70561",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/39/2365239_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "buseok-seosan": {
    "image": "/web/app/assets/spots/buseok-seosan.webp",
    "photoSource": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=92261",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/02/2802602_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "buseok-yeongju": {
    "image": "/web/app/assets/spots/buseok-yeongju.webp",
    "photoSource": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=111132",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/22/2654222_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "cafe-299": {
    "image": "/web/app/assets/spots/cafe-299.webp",
    "photoSource": "https://dev-story.kr/26",
    "photoOriginalUrl": "https://blog.kakaocdn.net/dna/cguB7g/btrsA6fd6Os/AAAAAAAAAAAAAAAAAAAAAC2IYd_RBBebE0aJGcOneoHOtzOOK9zIDIJlPk24_7xk/img.jpg?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1790780399&allow_ip=&allow_referer=&signature=sHADIGI%2BupGvuifx2k3XeBNnFqQ%3D",
    "photoCredit": "사진 · dev-story.kr",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "dansan": {
    "image": "/web/app/assets/spots/dansan.webp",
    "photoSource": "https://www.tripinfo.co.kr/info.html?content_id=547880&content_type_id=12",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/26/2534126_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "danyang-market": {
    "image": "/web/app/assets/spots/danyang-market.webp",
    "photoSource": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=216109",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/72/2366272_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "g-rider": {
    "image": "/web/app/assets/spots/g-rider.webp",
    "photoSource": "https://www.theneweconomy.kr/news/articleView.html?idxno=11658",
    "photoOriginalUrl": "https://cdn.theneweconomy.kr/news/photo/202406/11658_12147_4627.png",
    "photoCredit": "사진 · 신경제",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "gampo-market": {
    "image": "/web/app/assets/spots/gampo-market.webp",
    "photoSource": "https://data.visitkorea.or.kr/linkedview/2756602",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/39/2757139_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "ganwolam": {
    "image": "/web/app/assets/spots/ganwolam.webp",
    "photoSource": "https://data.visitkorea.or.kr/linkedview/125880",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/28/3499228_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "geojosa": {
    "image": "/web/app/assets/spots/geojosa.webp",
    "photoSource": "https://www.tripinfo.co.kr/info.html?content_id=2758318&content_type_id=12",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/09/2758509_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "goesan-market": {
    "image": "/web/app/assets/spots/goesan-market.webp",
    "photoSource": "https://data.visitkorea.or.kr/linkedview/132010",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/81/3353381_image2_1.JPG",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "gungnamji": {
    "image": "/web/app/assets/spots/gungnamji.webp",
    "photoSource": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=94970",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/42/3026142_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "gwangcheon-market": {
    "image": "/web/app/assets/spots/gwangcheon-market.webp",
    "photoSource": "https://www.tripinfo.co.kr/info.html?content_id=132042&content_type_id=38",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/93/1602793_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "haemi": {
    "image": "/web/app/assets/spots/haemi.webp",
    "photoSource": "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=faf7696c-ca1c-4848-bc6b-ba77bc0c96c8",
    "photoOriginalUrl": "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=847edf5b-9467-4a9b-9209-b707d94e08ea",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "heonhwa": {
    "image": "/web/app/assets/spots/heonhwa.webp",
    "photoSource": "https://data.visitkorea.or.kr/linkedview/2714722",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/76/3088776_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "hichichi": {
    "image": "/web/app/assets/spots/hichichi.webp",
    "photoSource": "https://www.diningcode.com/profile.php?rid=qMVNtxUNiVzV",
    "photoOriginalUrl": "https://d12zq4w4guyljn.cloudfront.net/750_750_20240303070127_photo1_2ed3367f84dd.webp",
    "photoCredit": "사진 · 다이닝코드 이용자",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "hongseong-market": {
    "image": "/web/app/assets/spots/hongseong-market.webp",
    "photoSource": "https://www.tripinfo.co.kr/info.html?content_id=2771854&content_type_id=38",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/42/2850142_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "hue-cafe-138": {
    "image": "/web/app/assets/spots/hue-cafe-138.webp",
    "photoSource": "https://www.kmnews.net/SPECIAL/?bmode=view&idx=6405213",
    "photoOriginalUrl": "https://cdn.imweb.me/thumbnail/20210422/124a78e59f63c.jpg",
    "photoCredit": "사진 · 한국이륜차신문",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "hwasodam": {
    "image": "/web/app/assets/spots/hwasodam.webp",
    "photoSource": "https://blog.naver.com/PostView.nhn?blogId=srad1340&logNo=224378567864&redirect=Dlog&widgetTypeCall=true",
    "photoOriginalUrl": "https://postfiles.pstatic.net/MjAyNjA4MTRfMTY4/MDAxNzg2Njg2Mjc1OTU5.UuEYSlcj8D0vXQCuKkbqPFesrIc9lZqq72m8TqQlksQg.AOAgdO6iUYnlSdHihjC3ZCrg7pxYoa1UCEQGU3XODN0g.JPEG/IMG%EF%BC%BF9180.jpg?type=w275",
    "photoCredit": "사진 · srad1340",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "jangho": {
    "image": "/web/app/assets/spots/jangho.webp",
    "photoSource": "https://www.tripinfo.co.kr/info.html?content_id=125711&content_type_id=12",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/61/2642261_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "jecheon-market": {
    "image": "/web/app/assets/spots/jecheon-market.webp",
    "photoSource": "https://www.tripinfo.co.kr/info.html?content_id=1309907&content_type_id=38",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/59/1303859_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "jiyong": {
    "image": "/web/app/assets/spots/jiyong.webp",
    "photoSource": "https://data.visitkorea.or.kr/linkedview/127281",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/99/878199_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "jukseoru": {
    "image": "/web/app/assets/spots/jukseoru.webp",
    "photoSource": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=86300",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/73/2654473_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "jumunjin-market": {
    "image": "/web/app/assets/spots/jumunjin-market.webp",
    "photoSource": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=90550",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/90/1162090_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "jusanji": {
    "image": "/web/app/assets/spots/jusanji.webp",
    "photoSource": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=104969",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/84/2616884_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "mad-brown": {
    "image": "/web/app/assets/spots/mad-brown.webp",
    "photoSource": "https://www.diningcode.com/profile.php?rid=7y59sw2oUX5v",
    "photoOriginalUrl": "https://d12zq4w4guyljn.cloudfront.net/750_750_20250401112344999_photo_f39c8df315b7.webp",
    "photoCredit": "사진 · 다이닝코드 이용자",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "muchangpo": {
    "image": "/web/app/assets/spots/muchangpo.webp",
    "photoSource": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=98513",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/40/2022140_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "muryangsa": {
    "image": "/web/app/assets/spots/muryangsa.webp",
    "photoSource": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=77012",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/09/2037209_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "namaste": {
    "image": "/web/app/assets/spots/namaste.webp",
    "photoSource": "https://www.diningcode.com/profile.php?rid=sL6uvvOyg4KE",
    "photoOriginalUrl": "https://d12zq4w4guyljn.cloudfront.net/750_750_20250902062036623_photo_157683141203.webp",
    "photoCredit": "사진 · 다이닝코드 이용자",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "neumanjang": {
    "image": "/web/app/assets/spots/neumanjang.webp",
    "photoSource": "https://blog.naver.com/PostView.nhn?blogId=dailylifesun&logNo=224387216306&redirect=Dlog&widgetTypeCall=true",
    "photoOriginalUrl": "https://postfiles.pstatic.net/MjAyNjA4MjNfMTk5/MDAxNzg3NDQzMTg1NjM2.d29lLwgkdsTbAXtwcWlACVKZhixO9FbzYYNqDyK6j5wg.L_dHAIntTy-6mB4mRQgxSZmaszAFZHp-RtFOD4SKIXQg.JPEG/IMG%EF%BC%BF6966.jpg?type=w386",
    "photoCredit": "사진 · dailylifesun",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "oeam": {
    "image": "/web/app/assets/spots/oeam.webp",
    "photoSource": "https://data.visitkorea.or.kr/linkedview/126001",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/30/3355130_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "ojanghwan": {
    "image": "/web/app/assets/spots/ojanghwan.webp",
    "photoSource": "https://infotravelog.com/places/21536",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/55/3339655_image2_1.JPG",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "rc79": {
    "image": "/web/app/assets/spots/rc79.webp",
    "photoSource": "https://blog.naver.com/PostView.nhn?blogId=eterna01&logNo=224347848068&redirect=Dlog&widgetTypeCall=true",
    "photoOriginalUrl": "https://postfiles.pstatic.net/MjAyNjA3MTRfMzYg/MDAxNzg0MDM2MTUxMDE5.HLATNga6xGINV_17YMc8nZtkVQswMvHkwH9AlZBiGfkg.Lrfsya182dqZnRVhnNvWAYQ0D1EbQRA7SlC_ZNetd54g.JPEG/IMG_1462.jpeg?type=w466",
    "photoCredit": "사진 · eterna01",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "rest-garden": {
    "image": "/web/app/assets/spots/rest-garden.webp",
    "photoSource": "https://data.visitkorea.or.kr/linkedview/3046071",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/66/3046066_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "road-66": {
    "image": "/web/app/assets/spots/road-66.webp",
    "photoSource": "https://blog.naver.com/PostView.nhn?blogId=ujin4ujin&logNo=224196298121&redirect=Dlog&widgetTypeCall=true",
    "photoOriginalUrl": "https://postfiles.pstatic.net/MjAyNjAxMTRfMTA0/MDAxNzY4Mzg3MTYzOTcx.TaTgQKV8jKZUIgGHshZDMQYKbwMz_sgKZHomnz2OYggg.0qniquWX7SZBrNWtE5Oyt63hZZh7BtVhPpHEDeoy0sMg.JPEG/900%EF%BC%BF20260114%EF%BC%BF183558.jpg?type=w773",
    "photoCredit": "사진 · ujin4ujin",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "route7": {
    "image": "/web/app/assets/spots/route7.webp",
    "photoSource": "https://blog.naver.com/PostView.nhn?blogId=tlsdo6127&logNo=224186218271&redirect=Dlog&widgetTypeCall=true",
    "photoOriginalUrl": "https://postfiles.pstatic.net/MjAyNjAyMTdfMTMx/MDAxNzcxMjk1NDQwMTU0.cp-2QAr5IaBipFL3VzffrmaP5anOBzkp_vEEmis9QF4g.Nzf0yXAkV9IiUYypsjar8N04ZpTM4lr7o7pkBxjXS1kg.JPEG/KakaoTalk_20260215_234754448_02.jpg?type=w773",
    "photoCredit": "사진 · tlsdo6127",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "royce": {
    "image": "/web/app/assets/spots/royce.webp",
    "photoSource": "https://blog.naver.com/PostView.nhn?blogId=ssunnong&logNo=224389059845&redirect=Dlog&widgetTypeCall=true",
    "photoOriginalUrl": "https://postfiles.pstatic.net/MjAyNjA4MjRfMjY1/MDAxNzg3NTYzMjQ0OTk4.bURa74dozItVoTg6MRKTbpS8DT7qWw7nXMYe3ER2rBsg.SHzP-WR3lujPKUhAVC5KB1XiSdTFiLJyvmippjZuxq4g.JPEG/IMG%EF%BC%BF2388.JPG?type=w966",
    "photoCredit": "사진 · ssunnong",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "rpm-moto": {
    "image": "/web/app/assets/spots/rpm-moto.webp",
    "photoSource": "https://blog.naver.com/PostView.nhn?blogId=yoonhye_1004&logNo=224345081280&redirect=Dlog&widgetTypeCall=true",
    "photoOriginalUrl": "https://postfiles.pstatic.net/MjAyNjA1MjdfMjc2/MDAxNzc5ODY2MTQ0OTMx.CSbeZloTz1JK1izr2zw_0kDc3_ojj-boaEzPlK4efAwg._BF33aVQfn01fI2LQbslR_up0M4itW1MEynBYU1zeY8g.JPEG/20260525_150352.jpg?type=w466",
    "photoCredit": "사진 · yoonhye_1004",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "sangseonam": {
    "image": "/web/app/assets/spots/sangseonam.webp",
    "photoSource": "https://data.visitkorea.or.kr/linkedview/1627287",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/96/3346096_image2_1.JPG",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "seongryu": {
    "image": "/web/app/assets/spots/seongryu.webp",
    "photoSource": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=90549",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/42/2613142_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "sosu": {
    "image": "/web/app/assets/spots/sosu.webp",
    "photoSource": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=111103",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/85/3499385_image2_1.JPG",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "sudeoksa": {
    "image": "/web/app/assets/spots/sudeoksa.webp",
    "photoSource": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=96644",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/85/2357885_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "two-stroke": {
    "image": "/web/app/assets/spots/two-stroke.webp",
    "photoSource": "https://www.motorcycle-story.com/post/727",
    "photoOriginalUrl": "https://www.motorcycle-story.com/uploads/cache/editor/2020/11/thumb-20201111144720_4c3e4550f217eba1e746132bc49c7a6e_pteq_300x.jpg",
    "photoCredit": "사진 · 모터사이클 스토리",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "uirim-forest": {
    "image": "/web/app/assets/spots/uirim-forest.webp",
    "photoSource": "https://www.tripinfo.co.kr/info.html?content_id=2751857&content_type_id=12",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/42/2751942_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "uljin-market": {
    "image": "/web/app/assets/spots/uljin-market.webp",
    "photoSource": "https://access.visitkorea.or.kr/ms/detail.do?cotId=acfaa3d5-f586-489b-9921-47c49a590b0e",
    "photoOriginalUrl": "https://access.visitkorea.or.kr/bfvk_img/call?cmd=VIEW&id=ce5f257f-ae2b-4559-82dd-dced4e0c7e34&",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "walking-stone": {
    "image": "/web/app/assets/spots/walking-stone.webp",
    "photoSource": "https://www.diningcode.com/profile.php?rid=EU8FvJ8NEUcl",
    "photoOriginalUrl": "https://d12zq4w4guyljn.cloudfront.net/750_750_20260818030121_photo1_a0bf52a91216.webp",
    "photoCredit": "사진 · 다이닝코드 이용자",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "yeongdeok-market": {
    "image": "/web/app/assets/spots/yeongdeok-market.webp",
    "photoSource": "https://www.tripinfo.co.kr/info.html?content_id=132283&content_type_id=38",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/12/1969012_image2_1.jpg",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "yeongju-market": {
    "image": "/web/app/assets/spots/yeongju-market.webp",
    "photoSource": "https://access.visitkorea.or.kr/ms/detail.do?cotId=01cbb77e-0049-4bd9-87b6-e70191b94aee",
    "photoOriginalUrl": "https://access.visitkorea.or.kr/bfvk_img/call?cmd=VIEW&id=a7d83316-34bd-471d-9f79-4a5d4f955ab9&",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  },
  "yeongwol-market": {
    "image": "/web/app/assets/spots/yeongwol-market.webp",
    "photoSource": "https://french.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=75870",
    "photoOriginalUrl": "https://tong.visitkorea.or.kr/cms/resource/14/3394714_image2_1.JPG",
    "photoCredit": "한국관광공사",
    "photoKind": "PLACE_PHOTO",
    "photoVerifiedAt": "2026-09-15",
    "reuseStatus": "unverified"
  }
};
  places.forEach(p=>{const entry=photos[p.id];if(!entry)return;if(typeof entry==='object'){Object.assign(p,entry);return;}p.image=entry.startsWith('https:')?entry:'https://tong.visitkorea.or.kr/cms/resource/'+entry;p.photoCredit=p.image.includes('visitkorea')?'한국관광공사 · 관광정보 사진':'장소 소개 매체 사진';p.photoSource=p.source;});
  root.SSKR_SPOT_CATALOG=places;
  if(typeof module!=='undefined')module.exports=places;
})(typeof window!=='undefined'?window:globalThis);
