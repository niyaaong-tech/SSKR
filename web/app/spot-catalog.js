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
  const photos={
    'the-road-1423':'https://www.mbzine.com/wp-content/uploads/2023/03/2303_life_cafe5-2.jpg',
    allride:'https://www.mbzine.com/wp-content/uploads/2023/03/2303_life_cafe2-2-2.jpg',
    bikongs:'https://www.mbzine.com/wp-content/uploads/2023/07/2307_place_bikongs_main.jpg',
    harleywood:'https://cdn.imweb.me/upload/S2020112077da751d9e507/515b293324ca4.jpg',
    'road-runner':'https://reitwagen-cdn.baree.net/1_c06c452440.jpeg',
    'gangneung-market':'66/3495766_image2_1.jpg','donghae-market':'02/3491802_image2_1.JPG','bukpyeong-market':'70/2741970_image2_1.jpg','jeongseon-market':'62/2733762_image2_1.jpg','gongju-market':'45/2393745_image2_1.jpg','yesan-market':'19/3039719_image2_1.jpg','daecheon-market':'67/2751167_image2_1.jpg',
    nongol:'25/1220425_image2_1.jpg',sindolseok:'50/201850_image2_1.jpg',hupo:'72/3065172_image2_1.JPG',sainam:'55/2917855_image2_1.jpg','uirim-museum':'02/3416202_image2_1.jpg',hwayang:'56/1848556_image2_1.jpg',gongsanseong:'68/2678668_image2_1.jpg'
  };
  places.forEach(p=>{if(photos[p.id]){p.image=photos[p.id].startsWith('https:')?photos[p.id]:'https://tong.visitkorea.or.kr/cms/resource/'+photos[p.id];p.photoCredit=p.image.includes('visitkorea')?'한국관광공사 · 관광정보 사진':'장소 소개 매체 사진';p.photoSource=p.source;}});
  root.SSKR_SPOT_CATALOG=places;
  if(typeof module!=='undefined')module.exports=places;
})(typeof window!=='undefined'?window:globalThis);
