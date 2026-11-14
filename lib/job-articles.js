export const ARTICLE_TOPICS = [
  { key: "karriere", label: "Jobb og karriere" },
  { key: "miljo", label: "Arbeidsmiljø" },
  { key: "ledelse", label: "Ledelse" },
  { key: "helse", label: "Kropp og følelser" },
  { key: "lonn", label: "Lønn og goder" },
  { key: "vilkar", label: "Stillinger og trygghet" },
  { key: "rettigheter", label: "Rettigheter" },
  { key: "sok", label: "Søk og intervju" },
  { key: "bransje", label: "Bransjer" },
  { key: "karing", label: "Beste arbeidsplass" },
];

const TOPIC_LABELS = Object.fromEntries(ARTICLE_TOPICS.map((topic) => [topic.key, topic.label]));

export function articleTopicLabel(key) {
  return TOPIC_LABELS[key] ?? "Artikkel";
}

export function articlePath(slug) {
  return `/artikler/${slug}`;
}

function publishedAtForIndex(index) {
  const start = Date.UTC(2026, 7, 7, 7, 30, 0);
  return new Date(start + index * 24 * 60 * 60 * 1000).toISOString();
}

function withMeta(article, index) {
  return {
    kind: "artikkel",
    published_at: publishedAtForIndex(index),
    ...article,
  };
}

export const JOB_ARTICLE_SEEDS = [
  {
    slug: "ny-jobb",
    query: "ny jobb",
    topic: "karriere",
    mood: "problem",
    title: "Ny jobb: magen vet ofte før LinkedIn gjør det",
    excerpt: "Magen knyter seg når du åpner stillingsannonsen, men du vet at du ikke kan bli.",
    body: `Det starter sjelden med et pent oppsigelsesbrev. Det starter med en søndag der du scroller etter «ny jobb» mens resten av huset ser på noe hyggelig. Du skammer deg nesten over søket, som om lojalitet skulle veie mer enn søvnen din.

En ny jobb ser ryddig ut i en annonse. I virkeligheten bytter du kultur, sjef, tempo og hvem du tør å være i lunsjen. Det er derfor magen reagerer først. Den husker forrige gang løftene var større enn mandagene.

Min Arbeidsplass håper å gjøre det søket mindre ensomt. Før du sender CV-en, kan du slå opp arbeidsplassen i Enhetsregisteret og se hvordan folk som faktisk har jobbet der scorer ledelse, miljø, lønn, balanse og kultur. Kåringen bygger på tidligere jobber, ikke på den sjefen du fortsatt er redd for.

Hvis du kjenner deg igjen, er du ikke illojal. Du er i ferd med å ta deg selv på alvor. Søk opp stedet du vurderer, les sladderen, og la neste steg skje med mer enn et håp og en pent formulert «vi er som en familie».`,
  },
  {
    slug: "bytte-jobb",
    query: "bytte jobb",
    topic: "karriere",
    mood: "problem",
    title: "Bytte jobb når du allerede har sagt det høyt til deg selv",
    excerpt: "Du har allerede sagt det høyt til deg selv: jeg orker ikke ett år til.",
    body: `Å bytte jobb er sjelden et karrierevedtak i PowerPoint. Det er en setning du først hvisker på vei hjem, og som etter noen måneder sitter i kroppen. Du presterer fortsatt. Du smiler i allmøtet. Inni deg har du allerede gått.

Folk googler «bytte jobb» når de trenger tillatelse. Tillatelse til å ville noe annet enn det som ser trygt ut på papiret. Det vanskelige er ikke å finne en stilling. Det vanskelige er å vite om neste sted bærer de samme sårene i en ny logo.

Derfor samler Min Arbeidsplass erfaringer fra folk som har sluttet, ikke bare fra dem som ennå må være lojale. Undersøkelsen teller i kåringen først når jobben ligger bak deg. Det er et valg. Ærlighet tåler dårlig at HR sitter ved siden av.

Bytter du fordi du vokser, håper vi å styrke den gleden: at det finnes steder der folk faktisk vil anbefale arbeidsplassen til en venn. Bytter du fordi noe er ødelagt, håper vi at du får se det før kontrakten er signert.`,
  },
  {
    slug: "si-opp-jobben",
    query: "si opp jobben",
    topic: "karriere",
    mood: "problem",
    title: "Si opp jobben uten å forsvinne i skyld",
    excerpt: "Du har skrevet oppsigelsen tre ganger og slettet den like mange.",
    body: `Oppsigelsen ligger i et dokument som heter «utkast». Du retter komma, så sletter du alt, så skriver du det om igjen klokken halv elleve. Skylden kommer fortere enn setningene. Tenk på kollegaene. Tenk på CV-en. Tenk på at det «egentlig ikke er så ille».

Det er ofte ille nok. Kroppen har allerede sagt opp. Hodet forhandler fortsatt.

Min Arbeidsplass kan ikke si opp for deg. Vi kan gjøre det neste kapitlet mindre blint. Når du først går, kan du ta arbeidsplassundersøkelsen for stedet du forlater — nettopp fordi du ikke lenger trenger å pynte. Det svaret kan spare neste person for det du bar alene.

Hvis du er i den uken der du åpner dokumentet igjen: du skylder ikke arbeidsplassen din helse. Du skylder deg selv en ærlig avgang, og dem som kommer etter deg et spor som ikke bare er en stillingsannonse.`,
  },
  {
    slug: "oppsigelse",
    query: "oppsigelse",
    topic: "vilkar",
    mood: "problem",
    title: "Oppsigelse: isklumpen i magen har et navn",
    excerpt: "Det er en isklump i magen når du blir kalt inn til et møte uten agenda.",
    body: `Ingen googler «oppsigelse» for moro skyld. Ordet kommer når kalenderen plutselig har et møte som ikke skulle vært der, eller når ryktene om runde to allerede har gått to ganger rundt kaffemaskinen.

Oppsigelse er juss og følelse på samme tid. Papirene kan være korrekte mens opplevelsen er at du blir visket ut. Kollegene ser ned i skjermen. Du pakker en kasse og later som det er praksis.

Vi kan ikke være advokaten din. Vi kan være stedet der mønsteret blir synlig. Hvis mange har sluttet, hvis sladderen handler om frykt, hvis scoren på ledelse stuper — da er oppsigelsen din kanskje ikke et enkeltuhell. Da er den kultur.

Min Arbeidsplass håper at færre skal måtte bære den isklumpen i isolasjon. Del det du tør, les det andre har turte, og la neste arbeidsplass velges med åpne øyne.`,
  },
  {
    slug: "provetid",
    query: "prøvetid",
    topic: "vilkar",
    mood: "problem",
    title: "Prøvetid føles som å holde pusten under vann",
    excerpt: "De første tre månedene føles som å holde pusten under vann.",
    body: `I prøvetid er du på ditt hyggeligste. Du ler av vitser som ikke er morsomme. Du sier ja til oppgaver som ikke er dine. Du googler i hemmelighet om det er normalt at magen er sånn.

Prøvetid er laget for at arbeidsgiver skal kunne avslutte raskt. Den blir fort et teater der du ikke tør å spørre hvordan det egentlig er å jobbe her, fordi du ennå ikke «har lov» til å være misfornøyd.

Min Arbeidsplass vil at du skal ha sett kulturen før dag én. Søk opp selskapet, les kåringen, les sladderen, se om ledelsen scorer som en plakat eller som et sted folk blir.

Overlever du prøvetiden med gleden i behold, håper vi å forsterke den: at du fant et sted der tillit ikke er noe du må gjøre deg fortjent til ved å forsvinne som person. Hvis ikke, er tre måneder bedre enn tre år i feil kultur.`,
  },
  {
    slug: "forste-jobb",
    query: "første jobb",
    topic: "karriere",
    mood: "problem",
    title: "Første jobb: vitnemålet sier ingenting om mandagene",
    excerpt: "Du har vitnemålet, men ingen som kan si deg hvordan mandagene faktisk er.",
    body: `Den første jobben skal være en seier. Ofte er den et sjokk. Skolen lærte deg faget. Ingen lærte deg hva du gjør når sjefen sender meldinger klokken ti om kvelden, eller når kollegaene har en humor du ikke er invitert inn i.

Nyutdannede googler «første jobb» fordi de er redde for å velge feil uten å ha noe å sammenligne med. Referansene dine er lærere. Magefølelsen har ikke fått data ennå.

Min Arbeidsplass håper å være den dataen. Ikke en karriererådgiver i dress, men spor etter folk som har vært der: hvordan ledelsen oppleves, om balansen holder, om kulturen er varm eller bare travelt hyggelig.

Ta den første jobben på alvor, men ikke på knærne. Et sted som fortjener deg, tåler at du har sjekket hvordan det er å jobbe der før du sier ja.`,
  },
  {
    slug: "nyutdannet-jobb",
    query: "nyutdannet jobb",
    topic: "karriere",
    mood: "problem",
    title: "Nyutdannet og redd for å lande i feil virkelighet",
    excerpt: "Alle sier at verden ligger for dine føtter. Ingen sier hvor hardt det er å lande.",
    body: `Du er nyutdannet, og LinkedIn er full av folk som «endelig starter». Du later som du også bare er spent. Under spenningen ligger en mer ærlig setning: hva om jeg sier ja til et sted som sliter meg opp før jeg har begynt?

Traineeprogrammer og «muligheter» kan være ekte. De kan også være billig arbeidskraft med fin grafikk. Forskjellen synes sjelden i brosjyren. Den synes i hvordan folk snakker om ledelsen når de ikke lenger trenger den.

Min Arbeidsplass er laget for det gapet. Vi vil at du skal kunne søke opp arbeidsplassen og møte noe mer enn employer branding. Undersøkelser, sladder og kåring er ikke fasit. De er spor.

Gleden ved å lande den første faste jobben skal få lov å være glede. Vi håper å beskytte den, ved å gjøre de dårlige landingene lettere å se på forhånd.`,
  },
  {
    slug: "karriere",
    query: "karriere",
    topic: "karriere",
    mood: "problem",
    title: "Karriere: stigen kan stå mot feil vegg",
    excerpt: "Du klatrer, men du vet ikke om stigen står mot riktig vegg.",
    body: `Karriere høres ut som en rett linje. I livet er det oftere en klump i halsen: du blir forfremmet, og likevel mer fremmed for deg selv. Du googler ordet fordi du vil at dagene skal henge sammen, ikke bare se imponerende ut.

En god karriere uten et levelig arbeidsmiljø er en fin tittel og en dårlig søvn. En roligere jobb med folk som tåler deg, kan være den egentlige stigningen.

Min Arbeidsplass måler ikke prestisje. Vi måler hvordan det oppleves å være der: ledelse, kultur, lønn, balanse, utvikling. Person–miljø-fit er der for dem som vil vite om stedet matcher måten de faktisk vil jobbe på, ikke bare CV-en.

Hvis karrieren din skal smake som livet ditt, trenger du mer enn neste steg. Du trenger å vite hvordan det er å puste der du lander.`,
  },
  {
    slug: "karriereskifte",
    query: "karriereskifte",
    topic: "karriere",
    mood: "problem",
    title: "Karriereskifte når du er lei av å være flink i feil liv",
    excerpt: "Du er lei av å være flink i noe som ikke lenger gir deg liv.",
    body: `Karriereskifte begynner sjelden med et kurs. Det begynner med en ettermiddag der du er dyktig, betalt og tom. Folk rundt deg sier at du «har det jo bra». Du nikker, og googler likevel.

Å bytte spor er skummelt fordi du mister den versjonen av deg som alle forstår. Det som er enda skumlere, er å bli i et spor som stjeler stemmen din.

Min Arbeidsplass kan ikke velge fag for deg. Vi kan vise deg hvordan det oppleves å være menneske på den andre siden: i staten, i en startup, i en storbank, i kommunen. Ikke som slogan, som score og historier.

Hvis skiftet er glede — et endelig ja til noe som ligner deg — vil vi styrke den gleden med ærlige bilder av arbeidsplassene du sikter mot. Hvis det er flukt, vil vi at flukten i det minste skal lande et sted som ikke gjentar skaden.`,
  },
  {
    slug: "trainee",
    query: "trainee",
    topic: "karriere",
    mood: "problem",
    title: "Trainee: du håper noen skal se deg, ikke bare bruke deg",
    excerpt: "Du jobber som om du allerede er ansatt, og sover som om de kan droppe deg i juni.",
    body: `Traineeprogrammer selges som døråpnere. Mange er det. Noen er et langt intervju der du bærer ansvar uten å bære trygghet. Du googler i stillhet: er det sånn det skal føles?

Du vil lære. Du vil også bli behandlet som et menneske, ikke som et kull som skal filtreres.

På Min Arbeidsplass kan du se hvordan selskapet scorer på utvikling, ledelse og kultur — av folk som har vært der lenger enn rekrutteringsdagen. Hvis «mulighetene» er ekte, vil det synes i at folk faktisk anbefaler stedet. Hvis ikke, vil sladderen ofte si det brosjyren ikke kan.

Gleden ved å komme inn et sted du beundrer, fortjener å overleve det første året. Vi håper å gjøre det lettere å skille de programmene som bygger deg, fra dem som bare låner deg.`,
  },
  {
    slug: "arbeidsmiljo",
    query: "arbeidsmiljø",
    topic: "miljo",
    mood: "problem",
    title: "Arbeidsmiljø merker du i kroppen før du har et språk for det",
    excerpt: "Du merker det i kroppen før du kan sette ord på det.",
    body: `Arbeidsmiljø er ikke fruktkurven. Det er om skuldrene synker eller stivner når du kommer inn døra. Folk søker på ordet når noe er galt, og når noe er så godt at de vil forstå hvorfor de plutselig trivs.

Loven snakker om forsvarlig arbeidsmiljø. Kroppen snakker tidligere. Søvnen. Helgen som blir for kort. Møtet du gruer deg til uten å vite helt hvorfor.

Min Arbeidsplass har arbeidsmiljø som egen kategori i kåringen, nettopp fordi det er der livet skjer mellom oppgavene. Vi vil at scoren skal komme fra folk som har kjent det over tid, ikke fra en intern trivselsundersøkelse som aldri forlater Teams.

Hvis miljøet ditt er godt, kommenter og forsterk det. Hvis det er dårlig, la det bli synlig for neste person som står der du sto, med den samme klumpen og det samme søket.`,
  },
  {
    slug: "darlig-arbeidsmiljo",
    query: "dårlig arbeidsmiljø",
    topic: "miljo",
    mood: "problem",
    title: "Dårlig arbeidsmiljø er søndagskvelden som aldri tar slutt",
    excerpt: "Du sover dårlig søndag kveld, og det er ikke fordi du har for mye å gjøre.",
    body: `Dårlig arbeidsmiljø forkles ofte som «høyt tempo» eller «tydelige krav». Du merker forskjellen når du er sliten av mennesker, ikke av faget. Når du øver på setninger før du går inn i gangen. Når du blir en versjon av deg selv du ikke vil ta med hjem.

Mange blir værende fordi lønna er grei, fordi kollegaene er i samme båt, fordi de håper at neste omorganisering skal redde det. Håp er ikke et arbeidsmiljø.

Min Arbeidsplass håper å navngi det uten at du må stå alene i varslingen fra dag én. Anonym sladder på bedriftssiden. Undersøkelse når du har gått. En kåring der dårlige steder ikke kan kjøpe seg bort fra svaret.

Du er ikke for sensitiv. Du har data i kroppen. La den møte data fra andre, før du bruker flere år på å tilpasse deg noe som aldri skulle vært normalt.`,
  },
  {
    slug: "godt-arbeidsmiljo",
    query: "godt arbeidsmiljø",
    topic: "miljo",
    mood: "glede",
    title: "Godt arbeidsmiljø er nesten å glede seg til mandag",
    excerpt: "Du gleder deg nesten til mandag. Nesten. Og det er verdifullt.",
    body: `Det finnes arbeidsplasser der lunsjen ikke er strategi. Der noen spør hvordan du har det og venter på svaret. Der du kan være uenig uten å bli et problem. Folk googler «godt arbeidsmiljø» både når de har mistet det, og når de har funnet det og nesten ikke tør tro på det.

Glede på jobb er ikke naivitet. Det er et konkurransefortrinn som sjelden står i kvartalsrapporten, og som likevel avgjør hvem som blir.

Min Arbeidsplass vil forsterke den gleden ved å gjøre den synlig. Når nok folk scorer miljø og kultur høyt, skal stedet stige i kåringen. Når arbeidsgiver svarer, skal de få rose det som er sant — uten å få slette det som er vondt.

Hvis du har et sted som holder deg, skriv det. Ikke som reklame. Som spor til dem som leter etter det samme nesten-mandagsgliset.`,
  },
  {
    slug: "mobbing-pa-jobb",
    query: "mobbing på jobb",
    topic: "miljo",
    mood: "problem",
    title: "Mobbing på jobb kan være stille og likevel ta pusten fra deg",
    excerpt: "Du sjekker hvem som er på kontoret før du går inn.",
    body: `Mobbing på jobb er ikke alltid skjellsord. Ofte er det blikk, kopier du ikke får, vitser som treffer deg og ingen som sier stopp. Du begynner å time kaffepausene. Du blir «for sensitiv». Du googler ordet og håper at det du kjenner har et navn.

Det har et navn. Og det er ikke din personlighet som er problemet når magen knyter seg av åpningstider.

Min Arbeidsplass er ikke et varslingsorgan. Vi er et sted der mønstre kan synes før du har en sak. Hvis mange beskriver den samme kulden, den samme sjefen, den samme gangen, er det kultur, ikke uflaks.

Håpet vårt er at færre skal måtte dokumentere seg i stykker i isolasjon. Les, skriv når du tør, og bruk det til å velge et sted der du ikke trenger å speide etter hvem som er på jobb før du tør å komme.`,
  },
  {
    slug: "utestenging-pa-jobb",
    query: "utestenging på jobb",
    topic: "miljo",
    mood: "problem",
    title: "Utestenging på jobb: ingen sier noe stygt, de bare slutter å ta deg med",
    excerpt: "Ingen sier noe stygt. De bare slutter å ta deg med.",
    body: `Utestenging er mobbing i slippform. Kalenderen har lunsjer du ikke visste om. Chatten har tråder du ikke er i. Du blir «litt utenfor», som om det var geografi og ikke et valg.

Det er vanskelig å anmelde en manglende invitasjon. Det er lett å tro at det er deg. Derfor sitter så mange stille og googler, i stedet for å si det høyt.

På Min Arbeidsplass kan sladderen bære det som er for mykt for et skjema og for hardt å bære alene. Undersøkelsen har kultur og arbeidsmiljø nettopp fordi utestenging ødelegger begge.

Hvis du kjenner deg usynlig på jobb, er du ikke usynlig her. Og hvis du har et sted der folk tar med, skriv det. Gleden ved å høre til fortjener å smitte.`,
  },
  {
    slug: "konflikter-pa-jobb",
    query: "konflikter på jobb",
    topic: "miljo",
    mood: "problem",
    title: "Konflikter på jobb ligger i luften lenge før de har et møtereferat",
    excerpt: "Luften i møterommet er tykk, og alle later som de ikke merker det.",
    body: `Konflikter på jobb kler seg ut som «faglig uenighet» til noen går sykemeldt. Du kjenner det når folk slutter å snakke i plenum og begynner å snakke i par. Når hvert prosjekt har en undertekst.

Noen konflikter er sunne. De fleste du googler om, er det ikke. De er ledersvikt forkledd som personkjemi.

Min Arbeidsplass håper å gjøre ledelsen synlig, ikke bare konflikten mellom to kolleger. Hvis scoren på ledelse er lav, hvis sladderen gjentar de samme navnløse mønstrene, er det et signal til deg som vurderer å gå inn i det rommet.

Vi kan ikke megle i saken din. Vi kan gi deg et kart over om stedet pleier å rydde, eller om det pleier å late som luften er lett.`,
  },
  {
    slug: "sladder-pa-jobb",
    query: "sladder på jobb",
    topic: "miljo",
    mood: "glede",
    title: "Sladder på jobb kan være gift — og det kan være den eneste sannheten",
    excerpt: "Du hører navnet ditt i gangen, og latteren dør når du kommer rundt hjørnet.",
    body: `Sladder har dårlig rykte, og noen ganger fortjener det det. Baktalelse er et arbeidsmiljøproblem. Men mye av det folk kaller sladder, er den uoffisielle rapporten: hvordan det faktisk er, sagt der mikrofonene ikke står på.

Du googler ordet i to stemninger. Enten er du såret. Eller så er du sulten på ærlighet.

Min Arbeidsplass har valgt å kalle sladderen ved navn, med vilje. På bedriftssiden kan du skrive anonymt. I kåringen må du være innlogget og bruke en tidligere jobb. Det skillet er et håp: at sannheten skal få plass uten at den blir et våpen uten ansvar.

Hvis sladderen der du er, gjør deg liten, er det et varsku. Hvis sladderen her gjør neste menneske klokere, er det noe av det mest verdifulle arbeidslivet har.`,
  },
  {
    slug: "giftig-arbeidsplass",
    query: "giftig arbeidsplass",
    topic: "miljo",
    mood: "problem",
    title: "Giftig arbeidsplass: du blir noen du ikke liker, bare for å overleve",
    excerpt: "Du blir en versjon av deg selv du ikke liker, bare for å overleve.",
    body: `En giftig arbeidsplass lærer deg å holde kjeft, smile og vinne små, stygge seire. Du merker det når du hører din egen stemme i et møte og tenker: sånn er ikke jeg. Jo, der er du blitt sånn.

Gift er sjelden én skurk. Det er insentiver, stillhet og en ledelse som kaller det «gjennomføringsevne».

Min Arbeidsplass håper å gjøre giften synlig før den er i blodet ditt. Lav score på kultur og ledelse. Gjentatte historier. Et sted som aldri blir anbefalt, uansett hvor fin karrieresiden er.

Du trenger ikke bli hardere. Du trenger et sted som ikke krever at du forsvinner. Bruk oss til å finne det, og til å advare dem som ennå tror at det bare er dem.`,
  },
  {
    slug: "kollegaer",
    query: "kollegaer",
    topic: "miljo",
    mood: "glede",
    title: "Kollegaer kan redde en kjedelig stilling — og ødelegge en drømmejobb",
    excerpt: "De rette folkene kan redde en kjedelig stilling. De gale kan ødelegge en drømmejobb.",
    body: `Du googler «kollegaer» når du savner dem, eller når du gruer deg til dem. Faget betyr mindre enn vi later som. Menneskene du sitter ved siden av, bestemmer om dagen er til å holde ut.

Gode kolleger er en av de stille gledene i arbeidslivet. De ser deg. De dekker deg. De gjør tirsdag til noe annet enn et hull i kalenderen.

Min Arbeidsplass måler kultur og anbefaling fordi kolleger ikke kan fanges i en stillingstittel. Sladderen er ofte nettopp dette: hvem det er godt å være i lag med, og hvor det er kaldt.

Hvis du har folk som holder deg, si det. Hvis du vurderer et sted, ikke bare spør om oppgaver. Spør hvordan det er å være menneske der — og se om noen har svart før deg.`,
  },
  {
    slug: "venner-pa-jobb",
    query: "venner på jobb",
    topic: "miljo",
    mood: "problem",
    title: "Venner på jobb kan være lyset — og det som holder deg fast",
    excerpt: "Du er redd for at vennskapet er det eneste som holder deg igjen.",
    body: `Venner på jobb er en gave. De er også en felle når arbeidsplassen er dårlig. Du blir værende for menneskene, mens du tæres av systemet. Du googler fordi du ikke vet om det er lojalitet eller frykt for å miste lunsjen.

Det er lov å elske kollegaene og likevel gå. Det er lov å håpe at neste sted også har noen å le med.

Min Arbeidsplass vil ikke romantisere «vi er som familie». Familier kan være varme og de kan være umulige å forlate. Vi vil vise kulturen slik folk opplever den, så du kan velge et sted der vennskap er en bonus, ikke et gissel.

Ta vennene med i hjertet. La arbeidsplassen måles på mer enn dem.`,
  },
  {
    slug: "darlig-ledelse",
    query: "dårlig ledelse",
    topic: "ledelse",
    mood: "problem",
    title: "Dårlig ledelse er smilet i allmøtet og kuttet i 1:1",
    excerpt: "Sjefen smiler i allmøtet og river deg i stykker i 1:1.",
    body: `Dårlig ledelse synes sjelden på LinkedIn-profilen til lederen. Den synes i magen din før møtet. I at du ikke tør å si at noe er umulig. I at ros er offentlig og kritikk er personlig.

Folk holder ut lenge, fordi sjefen «egentlig er dyktig» og fordi det å klage på ledelse fortsatt føles som å være vanskelig.

Min Arbeidsplass har ledelse som første kategori i arbeidsplassundersøkelsen av en grunn. En arbeidsplass kan ha fin kantine og likevel være utrygg. Kåringen skal ikke kunne løftes av merkevare alene.

Hvis du har en leder som ødelegger dagene, er du ikke alene. Hvis du har en som løfter, si det høyt. Vi håper å gjøre forskjellen umulig å pynte bort.`,
  },
  {
    slug: "god-ledelse",
    query: "god ledelse",
    topic: "ledelse",
    mood: "glede",
    title: "God ledelse er at du tør å si ifra",
    excerpt: "Du tør å si ifra, fordi du vet at noen faktisk lytter.",
    body: `God ledelse kjennes som luft. Du merker den mest når du har manglet den. Det er ikke kickoff og verdier på veggen. Det er at feil kan sies. At kreditt deles. At noen beskytter tiden din.

Folk søker «god ledelse» når de har fått smake den og vil ikke miste den, eller når de lengter så det gjør vondt.

Min Arbeidsplass vil forsterke den gleden ved å la den telle. Høye ledelsesscore skal synes i kåringen. Arbeidsgivere kan svare på innsikt — de kan ikke slette det som er sant.

Hvis du har en leder som gjør deg bedre, skriv det. Det er like viktig som advarslene. Neste person fortjener å vite at slike steder finnes.`,
  },
  {
    slug: "sjefen",
    query: "sjefen",
    topic: "ledelse",
    mood: "problem",
    title: "Sjefen: når én persons humør er været på jobben",
    excerpt: "Hele arbeidsdagen kretser rundt humøret til ett menneske.",
    body: `«Sjefen» er et av de mest googlete ordene i arbeidslivet, og det er sjelden nøytralt. Enten sjekker du om det er normalt at alt handler om én persons dag, eller så leter du etter språket for noe du allerede vet.

En arbeidsplass skal tåle at lederen har en dårlig dag. Den skal ikke være den dårlige dagen.

Min Arbeidsplass samler opplevelser av ledelse uten at du må henge ut et navn i åpen gate. Mønsteret er poenget. Hvis mange beskriver frykt, er det kultur. Hvis mange beskriver ryggrad, er det også kultur.

Håpet er at du skal kunne velge neste sjef med mer enn et smil i intervjuet. Smil er billig. Score over tid er det ikke.`,
  },
  {
    slug: "mellomleder",
    query: "mellomleder",
    topic: "ledelse",
    mood: "problem",
    title: "Mellomleder: skylden ovenfra og motstanden nedenfra",
    excerpt: "Du får skylden ovenfra og motstand nedenfra, og ingen takker deg.",
    body: `Mellomlederen er limet som sprekker. Du skal oversette strategi til mennesker og menneskers slitasje tilbake til strategi. Ofte vil ingen av delene høre det du bærer.

Mange tar lederjobben av plikt, lønn eller mangel på alternativer. Så sitter de der, googler «mellomleder», og kjenner at de har mistet kollegaene uten å få et ekte lag over seg.

Min Arbeidsplass ser deg. Fit-testen spør hvordan du vil ha det, ikke bare hva tittelen heter. Bedriftssidene viser om stedet bærer lederne sine eller kverner dem.

Hvis du stortrives i laget mellom, si det. Hvis du går tom, er det ikke fordi du er for svak. Det kan være fordi huset er bygget for at midten skal ta støyen.`,
  },
  {
    slug: "ny-sjef",
    query: "ny sjef",
    topic: "ledelse",
    mood: "problem",
    title: "Ny sjef: alt som var greit i fjor, er plutselig usikkert",
    excerpt: "Alt som var greit i fjor, er plutselig usikkert.",
    body: `En ny sjef kan være redningen. Den kan også være et stilskifte ingen ba om. Du googler fordi luften har endret seg, og fordi du ikke vet om du skal vente, smiske eller gå.

De første månedene med ny ledelse er fulle av «vi får se». Kroppen din ser allerede.

Min Arbeidsplass kan ikke predikere den nye personen. Vi kan vise hva stedet har gjort med ledelse før, og hva folk som har sluttet tok med seg. Kultur spiser nye sjefer til frokost like ofte som sjefer spiser kultur.

Gi det en sjanse hvis gleden er der. Gå hvis frykten er det eneste som vokser. Du trenger ikke være den som «gir det litt mer tid» mens du selv blir borte.`,
  },
  {
    slug: "mikrostyring",
    query: "mikrostyring",
    topic: "ledelse",
    mood: "problem",
    title: "Mikrostyring: du får ikke puste uten at noen spør hvor du er i oppgaven",
    excerpt: "Du får ikke puste uten at noen spør hvor du er i oppgaven.",
    body: `Mikrostyring kalles gjerne «tett oppfølging». Du kjenner den som overvåking. Statusmøter om statusmøtene. Skjermbilder. Spørsmål om hvorfor du var tre minutter sen ut av en annen samtale.

Tillit er produktivitet. Kontroll er frykt i et fint ark. Folk som blir mikrostyrt slutter å tenke, og så blir de kjeftet på for å ikke tenke.

Min Arbeidsplass spør om ledelse og om hvordan det faktisk er å jobbe her, nettopp for å fange dette. Person–miljø-fit er nyttig hvis du trives med rammer — og et varsku hvis du trenger luft og stedet ikke har noe.

Du er ikke vanskelig fordi du vil gjøre jobben ferdig uten et publikum. Du er voksen. Finn et sted som behandler deg som det.`,
  },
  {
    slug: "tillit-pa-jobb",
    query: "tillit på jobb",
    topic: "ledelse",
    mood: "glede",
    title: "Tillit på jobb er kulturen som fortsatt puster",
    excerpt: "Du slutter å si hva du tenker, og det er der kulturen dør.",
    body: `Tillit er stille når den er der. Du merker den når du kan si «dette blir ikke bra» og rommet ikke straffer deg. Du merker mangelen når du redigerer deg selv i Slack som om det var en rettssak.

Arbeidsplasser uten tillit blir pene og tomme. Alle er enige. Ingen tror på det.

Min Arbeidsplass håper å styrke tilliten ved å gi den et språk. Høye kultur- og ledelsesscore. Sladder som ikke bare er gift, men også «her tør vi». Arbeidsgivere som tåler innsikt uten å slette den.

Hvis du har tillit der du er, vern om den. Hvis du har mistet den, er det et ras, ikke et humør. Neste sted skal du kjenne etter i det første møtet: tør jeg si nei her?`,
  },
  {
    slug: "utbrent",
    query: "utbrent",
    topic: "helse",
    mood: "problem",
    title: "Utbrent: du er ikke lat. Du er tom.",
    excerpt: "Du er ikke lat. Du er tom.",
    body: `Utbrenthet googles av folk som fortsatt svarer på e-post. Du er ikke i sofaen. Du er i et møte og hører din egen stemme langt borte. Kaffen virker ikke. Gleden ved faget er borte, og skylden har flyttet inn.

Mange venter på en krise som ser ut som en krise. Utbrenthet ser ofte ut som lojalitet.

Min Arbeidsplass kan ikke gi deg sykemeldingen. Vi kan vise om stedet du er, eller stedet du vurderer, har et mønster av slitasje: lav balanse, dårlig ledelse, kultur som hyller de som aldri går hjem.

Håpet er at du skal få gå før du er tom, eller komme tilbake til et sted som ikke krever at du brenner deg opp for å være verdifull. Tomhet er et varsel, ikke en karakterbrist.`,
  },
  {
    slug: "stress-pa-jobb",
    query: "stress på jobb",
    topic: "helse",
    mood: "problem",
    title: "Stress på jobb som ikke slår seg av når du logger av",
    excerpt: "Kroppen er i alarmmodus lenge etter at du har logget av.",
    body: `Stress er ikke det samme som å ha mye å gjøre. Stress er å ha for mye som ikke kan sies, for korte frister og for lite rom til å gjøre noe skikkelig. Du tar det med i kassa. I køen. I stemmen til barna.

Norsk arbeidsliv elsker å kalle det «perioder». Periodene har en lei tendens til å bli klima.

I undersøkelsen vår bor dette i balanse og ledelse. På bedriftssiden bor det i sladderen om kveldsjobbing som «bare er sånn her». Min Arbeidsplass håper å gjøre det synlig, så du ikke trenger å tro at nervesystemet ditt er for svakt.

Litt spenning kan være glede. Alarm hele kvelden er det ikke. Velg steder som lar kroppen komme hjem når du gjør det.`,
  },
  {
    slug: "sondagsangst",
    query: "søndagsangst",
    topic: "helse",
    mood: "problem",
    title: "Søndagsangst: lørdagen er fin til magen husker mandag",
    excerpt: "Lørdag kveld er fin, til magen husker at mandag kommer.",
    body: `Søndagsangst er ikke latskap før uka. Det er kroppen som husker rommet du skal inn i. Du kjenner den i maten som ikke smaker, i at du legger deg for tidlig og likevel ikke sover, i at du scroller jobbting «bare for å være føre var».

Alle har en kjedelig søndag av og til. Når det er hver uke, er det data.

Min Arbeidsplass vil at den angsten skal få et kart. Hvilken arbeidsplass. Hvilken ledelse. Hvilken kultur. Ikke som diagnose, som spor. Når du en dag søker etter ny jobb, skal du kunne se om mandagene der er noe folk faktisk holder ut.

Håpet er ikke at alle skal elske søndag kveld. Håpet er at færre skal frykte den.`,
  },
  {
    slug: "jeg-hater-jobben-min",
    query: "jeg hater jobben min",
    topic: "helse",
    mood: "problem",
    title: "Jeg hater jobben min — og skammer meg fordi lønna er grei",
    excerpt: "Du skammer deg over å ha det sånn, fordi lønna er grei.",
    body: `Hat er et sterkt ord, og likevel søker folk det i stillhet. Du hater ikke nødvendigvis oppgavene. Du hater versjonen av deg som jobben krever. Så ser du lønnsslippen og tenker at du ikke har lov.

Du har lov. Penger kan kjøpe mat. De kan ikke kjøpe tilbake et nervesystem.

Min Arbeidsplass er et sted å legge fra deg skammen. Undersøkelsen, sladderen, kommentarene under artikler som denne: du er ikke utakknemlig. Du er ærlig. Kåringen finnes nettopp fordi noen steder fortjener å tapes mot noen som behandler folk bedre.

La hatet bli et kompass, ikke et hjem. Finn ut hva du hater — ledelsen, tempoet, tomheten — og bruk det til å søke mer presist enn «hva som helst annet».`,
  },
  {
    slug: "motivasjon-pa-jobb",
    query: "motivasjon på jobb",
    topic: "helse",
    mood: "problem",
    title: "Motivasjon på jobb forsvinner stille, ikke i en stor krise",
    excerpt: "Du gjør det du skal, men lyset i øynene er borte.",
    body: `Motivasjon dør sjelden på en fredag. Den tykner. Du leverer. Du får til og med skryt. Inni deg er det som å se på jobben gjennom glass. Folk googler ordet i håp om et triks. Ofte trenger de et annet sted, ikke en ny podkast.

Motivasjon kommer tilbake der du blir sett, der arbeidet betyr noe, og der du ikke må spille.

Min Arbeidsplass spør om faglig utvikling, kultur og anbefaling fordi motivasjon bor der. Person–miljø-fit er for dem som har mistet gnisten i feil klima, ikke i feil yrke.

Hvis gnisten er der, vern om den. Hvis den er borte, slutt å straffe deg med mer kaffe. Se ærlig på stedet — og på om neste sted har folk som fortsatt har lyset i øynene.`,
  },
  {
    slug: "mening-i-jobben",
    query: "mening i jobben",
    topic: "helse",
    mood: "glede",
    title: "Mening i jobben er mer enn en vakker visjon på veggen",
    excerpt: "Du vil at dagene skal bety noe mer enn timer i et system.",
    body: `Mening er ikke at arbeidsgiver har en purpose-slide. Mening er at du kjenner at noen har det bedre fordi du var på jobb, eller at noe ble mer sant, pent, trygt eller levende. Når det mangler, blir selv god lønn tynn.

Mange skammer seg over å ville mening. Som om det var luksus. Det er det ikke. Det er det som gjør at du orker å være voksen i mange timer om dagen.

Min Arbeidsplass kan ikke gi deg mening. Vi kan vise steder der folk faktisk anbefaler arbeidsplassen, der utviklingen scorer, der kulturen ikke er kynisk. Det er ofte der meningen får lov å overleve.

Hvis du har den, skriv det. Gleden smitter dårlig i stillhet. Hvis du leter, la oss være et kart, ikke enda en visjon.`,
  },
  {
    slug: "kjedelig-jobb",
    query: "kjedelig jobb",
    topic: "helse",
    mood: "problem",
    title: "Kjedelig jobb: tryggheten er der, gleden er det ikke",
    excerpt: "Tryggheten er der. Gleden er det ikke.",
    body: `En kjedelig jobb kan være en velsignelse etter kaos. Den kan også være en lang, lunken avskjed med deg selv. Du googler fordi du ikke vet om du får lov til å ville mer når «ingenting er galt».

Kjedsomhet er et signal. Noen ganger om at du er utbrent og trenger kjedelig. Noen ganger om at du er ferdig.

Min Arbeidsplass skiller ikke mellom spennende merkevarer og grå kontorer. Vi spør hvordan det er å være der. Et kjedelig sted med god ledelse kan være gull. Et kjedelig sted med dårlig kultur er bare langsomt.

Du har lov til å ville glede, ikke bare fravær av krise. Søk etter steder der folk forteller om liv, ikke bare om at det går fint.`,
  },
  {
    slug: "sykemeldt-jobb",
    query: "sykemeldt",
    topic: "helse",
    mood: "problem",
    title: "Sykemeldt og redd for at fraværet skal bli et merke i panna",
    excerpt: "Du er redd for at fraværet skal bli merke i panna di.",
    body: `Sykemelding googles av folk som allerede er for syke til å spille friske, og likevel gjør det. Skylden kommer før legen. Hva vil sjefen si. Hva vil kollegaene tenke. Hva står i personalmappa.

Et sted som straffer sykdom, er et sted som produserer mer sykdom.

Min Arbeidsplass håper å synliggjøre kulturer der folk tør å være mennesker. Balanse, ledelse, sladder om «her skal du ikke være syk». Når du en dag skal videre, skal du kunne se om neste arbeidsplass behandler kroppen som et problem eller som et vilkår.

Du skylder ikke å være tilgjengelig i feber. Du skylder deg selv et sted som tåler at folk blir syke — fordi folk blir syke.`,
  },
  {
    slug: "psykisk-helse-jobb",
    query: "psykisk helse jobb",
    topic: "helse",
    mood: "problem",
    title: "Psykisk helse på jobb: du later som alt er fint",
    excerpt: "Du later som alt er fint, mens du teller dager til helgen.",
    body: `Psykisk helse på jobb er fortsatt noe vi pynter. Du smiler i stand-up og har hjertebank i toalettet. Du googler i privat vindu. Du er redd for at ærlighet skal bli «ikke robust nok».

Robusthet er å si ifra. Skjørhet er å tvinges til teater.

Min Arbeidsplass er ikke terapi. Vi er et sted der arbeidsmiljø og ledelse kan beskrives uten at navnet ditt først må ligge i en HR-sak. Kåringen bygger på tidligere jobber, nettopp så du slipper å være modig på bekostning av den jobben du fortsatt har.

Hvis du har det vondt, er du ikke alene i søkefeltet. La det du bærer bli et krav til neste sted: her skal det gå an å være menneske.`,
  },
  {
    slug: "balanse-jobb-og-fritid",
    query: "balanse jobb og fritid",
    topic: "helse",
    mood: "problem",
    title: "Balanse mellom jobb og fritid: du er hjemme, hodet er det ikke",
    excerpt: "Du er til stede hjemme, men hodet er fortsatt i innboksen.",
    body: `Balanse er ikke en yogamatte i kjelleren. Det er om kvelden er din. Folk søker ordet når partneren har sagt det, når barna har sluttet å spørre, når du merker at du er et halvt menneske i sofaen.

Norske arbeidsplasser er flinke til å si at de bryr seg om balanse. Tallene og sladderen forteller noe annet oftere enn karrieresidene gjør.

Derfor er balanse en egen kategori hos oss. Min Arbeidsplass håper å gjøre gapet mellom plakat og praksis synlig, så du kan velge et sted der livet utenfor jobben ikke er en unnskyldning.

Hvis du har balansen, er det glede verdt å dele. Hvis du har mistet den, er det ikke fordi du er dårlig til å «sette grenser» i et system som straffer grenser.`,
  },
  {
    slug: "hjemmekontor",
    query: "hjemmekontor",
    topic: "helse",
    mood: "problem",
    title: "Hjemmekontor: du sparer reisetid og mister de små samtalene",
    excerpt: "Du sparer reisetid og mister de små samtalene som holdt deg oppe.",
    body: `Hjemmekontor var en redning. For noen er det fortsatt glede: stillhet, barn i nærheten, ingen togtunnel. For andre er det et kontor som aldri stenger, og et lag som ble til ikoner.

Du googler fordi policyen er uklar, eller fordi du kjenner deg ensom i joggebuksa og skammer deg over det.

Min Arbeidsplass vil at hybrid og hjemmekontor skal beskrives av folk, ikke av fasilitetsprosjektet. I fit og i sladderen kommer det fram om stedet stoler på deg, eller om hjemmekontor er et privilegium du kan miste hvis du ikke synes nok.

Velg etter hvordan du faktisk lever. Glede i hjemmekontor er ekte. Så er savnet etter å bli sett. Begge deler fortjener et ærlig sted.`,
  },
  {
    slug: "hybridarbeid",
    query: "hybridarbeid",
    topic: "helse",
    mood: "problem",
    title: "Hybridarbeid der ingen vet hvor de skal være",
    excerpt: "Ingen vet egentlig hvor de skal være, og alle later som det er avklart.",
    body: `Hybridarbeid skulle være det beste fra to verdener. Ofte er det det dårligste: kontordager uten de folkene du trengte, hjemmedager med dårlig samvittighet, og en leder som teller hoder.

Du googler fordi du vil ha en regel. Arbeidsplassen din har en stemning i stedet.

Hos Min Arbeidsplass håper vi at slike stemninger skal skrives ned. Er det tillit eller kontroll. Er det glede over fleksibilitet, eller et skuespill om «kultur i kantine».

Et godt hybridsted er en gave. Vi vil styrke den gleden ved å la den synes. Et dårlig er bare pendling uten mening. Det skal også synes.`,
  },
  {
    slug: "overtid",
    query: "overtid",
    topic: "lonn",
    mood: "problem",
    title: "Overtid: du sier ja igjen og kjenner at du svikter deg selv",
    excerpt: "Du sier ja igjen, og kjenner at du svikter deg selv.",
    body: `Overtid kan være en intens periode og en felles dugnad. Den kan også være forretningsmodellen. Du merker forskjellen når «denne uka» blir kalenderen, og når nei koster mer enn ja.

Mange i Norge er stolte av å være lojale. Lojalitet uten hvile er bare forbruk.

Min Arbeidsplass fanger dette i balanse, i lønn og goder, og i sladderen om kvelder som aldri er frivillige. Vi håper du skal se om overtid betales, om den takkes, eller om den bare forventes.

Si ja når det er mening og slutt. Si nei når det er kultur. Og velg neste sted etter hva folk som har sluttet, ikke etter hva som sto i utlysningen.`,
  },
  {
    slug: "turnus",
    query: "turnus",
    topic: "vilkar",
    mood: "problem",
    title: "Turnus: kroppen har sluttet å forstå når det er natt",
    excerpt: "Kroppen din har sluttet å forstå når det er natt.",
    body: `Turnus er samfunnet som sover mens noen holder det i gang. Den kan være stolthet og fellesskap. Den kan også være et liv i jetlag uten fly. Du googler når søvnen er ødelagt, når helgene forsvinner, når du kjenner deg gammel for tidlig.

Turnus er ikke et personlighetsproblem. Det er fysikk og bemanning.

Min Arbeidsplass vil at helse, ledelse og kultur i turnusyrker skal kunne sies uten at det bare blir «sånn er det i sektoren». Søk opp arbeidsplassen. Se om folk anbefaler den. Se om sladderen handler om kolleger som bærer, eller om lister som aldri går opp.

Hvis du elsker faget i turnus, håper vi å styrke den gleden ved å vise de stedene som verner søvnen. Hvis du går i stykker, er det et varsel til neste søker — og til deg selv.`,
  },
  {
    slug: "nattarbeid",
    query: "nattarbeid",
    topic: "vilkar",
    mood: "problem",
    title: "Nattarbeid: verden sover, og du er våken med ansvaret",
    excerpt: "Verden sover, og du er våken med en kaffe og et ansvar.",
    body: `Nattarbeid har en egen ensomhet. Gledene finnes: stillhet, tillegget, gjengen som kjenner mørket. Prisen er også der, i kroppen og i familiene som lever i en annen klokke.

Du googler fordi du lurer på om det er verdt det, eller om det er du som er «for tynn».

Min Arbeidsplass håper å gjøre forskjellen mellom steder som betaler og bemanner natten skikkelig, og steder som bare trenger at noen er der. Undersøkelser og sladder fra folk som har stått i det, er mer verdt enn en setning om «turnustillegg» i en annonse.

Du holder samfunnet oppe. Da skal arbeidsplassen holde deg.`,
  },
  {
    slug: "fire-dagers-uke",
    query: "4-dagers uke",
    topic: "helse",
    mood: "glede",
    title: "4-dagers uke: du tør nesten ikke håpe at det går an der du er",
    excerpt: "Du tør nesten ikke håpe at det går an der du er.",
    body: `Fire dagers uke er blitt et håp folk googler som om det var science fiction. Noen steder prøver. De fleste smiler og sier at det ikke passer «vår bransje». Ofte betyr det at det ikke passer ledelsens vaner.

Gleden ved en uke som har plass til et liv, er ikke latskap. Det er voksen livsdesign.

Min Arbeidsplass kan ikke innføre fire dagers uke. Vi kan vise hvordan balanse faktisk scorer, og om kulturen straffer dem som går klokken fire. Det er der håpet enten lever eller dør.

Hvis du har fått det til, fortell. Hvis du lengter, bruk oss til å finne arbeidsplasser der tiden allerede behandles som om den var din.`,
  },
  {
    slug: "seks-timers-dag",
    query: "6-timers dag",
    topic: "helse",
    mood: "glede",
    title: "6-timers dag er ikke bare for de andre",
    excerpt: "Du lurer på om det bare er for de andre, aldri for deg.",
    body: `Seks timers dag høres ut som noe som skjer i en annen kommune, i en annen bransje, for folk som er mer verdifulle enn deg. Så sitter du i den åttende timen og gjør noe som kunne vært gjort hvis dagen var tettere og snillere.

Kortere dag er ikke magi. Det er prioritering. Noen arbeidsplasser tåler det. Noen bruker tid som om den var gratis.

Min Arbeidsplass håper å løfte stedene der folk faktisk har et liv etter jobb — i score, i historier, i kåring. Ikke som et manifest, som spor.

Tiden din er ikke et frynsegode. Den er livet. Søk etter arbeidsplasser som oppfører seg deretter.`,
  },
  {
    slug: "lonn",
    query: "lønn",
    topic: "lonn",
    mood: "problem",
    title: "Lønn: du vet at du er underbetalt, men tør ikke spørre",
    excerpt: "Du vet at du er underbetalt, men du tør ikke spørre hva de andre tjener.",
    body: `Lønn er tall og skam i samme søk. Du åpner statistikk, lukker den, åpner den igjen. Du er redd for å virke grådig. Du er redd for å oppdage at du har vært snill i årevis.

Hemmelighold rundt lønn er sjelden til din fordel.

Min Arbeidsplass har lønn og goder som kategori, ikke fordi vi er et lønnsregister, men fordi opplevelsen av å bli verdsatt hører til i kåringen. Sladderen vil ofte si det tabellen ikke kan: om bonusen er ekte, om tilleggene kommer, om «vi matcher markedet» er et eventyr.

Du får lov til å ville betalt. Du får lov til å ville rettferdighet. Se stedet i øynene før du tar enda et «vi tar det i medarbeidersamtalen».`,
  },
  {
    slug: "lonnsforhandling",
    query: "lønnsforhandling",
    topic: "lonn",
    mood: "problem",
    title: "Lønnsforhandling: hendene svetter før du sier tallet",
    excerpt: "Hendene svetter før du i det hele tatt sier tallet.",
    body: `Lønnsforhandling er teater der den ene parten har alle mappene. Du øver i speilet. Du senker tallet i hodet før du har åpnet munnen. Etterpå kjenner du deg både feig og grådig.

Det er ikke du som er rar. Det er makten som er skjev.

Min Arbeidsplass kan ikke forhandle for deg. Vi kan gi deg et bilde av om stedet vanligvis behandler folk anstendig: lønn og goder, ledelse, om de anbefales. Et sted med dårlig kultur vinner sjelden forhandlingen på en måte du kan leve med.

Gå inn med tall, men også med mage. Hvis gleden ved jobben er ekte, kan forhandlingen være et voksen nei og et voksen ja. Hvis den ikke er det, er tallet bare lim.`,
  },
  {
    slug: "lonnsstatistikk",
    query: "lønnsstatistikk",
    topic: "lonn",
    mood: "problem",
    title: "Lønnsstatistikk i hemmelighet, som om nysgjerrighet var skam",
    excerpt: "Du googler i hemmelighet, som om nysgjerrigheten var noe å skamme seg over.",
    body: `Lønnsstatistikk er et av de mest ærligesøkene vi gjør. Ingen vil innrømme at de sammenligner. Alle gjør det. Du vil vite om du er teit som ble, eller teit som ikke ba om mer.

Statistikk uten kultur er halvparten. En høy lønn i et dårlig miljø er en dyr måte å bli syk på. En lavere lønn i et lag som holder deg, kan være klokt — hvis det er et valg, ikke en felle.

Min Arbeidsplass legger kulturen ved siden av pengene. Vi håper du skal kunne holde to tanker: hva tjener folk, og hvordan er det å være der.

Lukk ikke fanen. Du har rett til å vite. Så har du rett til å ville mer enn medianen: å ville et sted som tåler ærlighet.`,
  },
  {
    slug: "bonus",
    query: "bonus",
    topic: "lonn",
    mood: "problem",
    title: "Bonusen kom, og likevel føles det som de kjøpte stillheten din",
    excerpt: "Bonusen kom, og likevel føles det som de kjøpte stillheten din.",
    body: `Bonus kan være glede. Den kan også være et bånd. Du smiler i chatten, og kjenner at du nettopp ble dyrere å miste — og dyrere å si ifra i.

Folk googler «bonus» når de lurer på om den er sann, om den er rettferdig, om den kommer til å styre dem.

På Min Arbeidsplass hører dette hjemme i lønn og goder, og i sladderen om hvem som fikk og hvem som ble «tatt i betraktning». Vi håper å gjøre bonusen mindre mytisk og mer menneskelig.

Ta imot gleden hvis den er ærlig. La den ikke kjøpe kvelden din, helgen din eller stemmen din.`,
  },
  {
    slug: "goder-pa-jobb",
    query: "goder på jobb",
    topic: "lonn",
    mood: "problem",
    title: "Goder på jobb veier lite når kulturen er råtten",
    excerpt: "Fruktkurven veier lite når kulturen er råtten.",
    body: `Goder er det arbeidsgivere elsker å fotografere. Kaffe. Telefon. Kantine. «Utvikling». Du googler fordi du vil vite hva som er normalt, og fordi du kjenner at godene brukes som svar på noe som ikke er et kaffespørsmål.

Et eple løser ikke en sjef. Et treningsabonnement løser ikke søndagsangsten.

Min Arbeidsplass spør om lønn og goder sammen med ledelse og kultur, nettopp så ingen skal kunne pynte seg til topps i kåringen med en smoothiebar. Arbeidsgivere kan fortelle om godene. De kan ikke slette at folk ikke har det bra.

Gleder deg over godene, si det. De kan være ekte omsorg. Bare ikke la dem bli sminke.`,
  },
  {
    slug: "feriepenger",
    query: "feriepenger",
    topic: "lonn",
    mood: "glede",
    title: "Feriepenger: du teller dager fordi du trenger å puste",
    excerpt: "Du teller dager, ikke fordi du elsker ferie, men fordi du trenger å puste.",
    body: `Feriepenger er et av de få ordene i arbeidslivet som fortsatt kan smake som glede. De er også et barometer. Hvis du lengter så det gjør vondt, er det ikke bare ferie du trenger. Det er avstand.

Et sted som gjør ferie til et problem, har fortalt deg hvem de er.

Min Arbeidsplass vil at balanse og kultur skal synes før du bruker ferien på å komme deg etter jobben. Hvis du har et sted som vil at du skal reise, si det. Det er en stille, stor ting.

Pust. Så velg — når du kommer tilbake — om du går tilbake til noe som fortjener deg.`,
  },
  {
    slug: "pensjon-jobb",
    query: "pensjon jobb",
    topic: "lonn",
    mood: "problem",
    title: "Pensjon på jobb er fremtiden du aldri har sjekket",
    excerpt: "Fremtiden din bygges i et punkt du aldri har sjekket.",
    body: `Pensjon er kjedelig helt til den er personlig. Du googler når du bytter jobb, når en kollega nevner innskudd, når du skjønner at du har sagt ja til noe uten å lese linjen.

Det er lov å være 25 og bry seg. Det er lov å være 55 og være sint.

Min Arbeidsplass er ikke en pensjonskalkulator. Vi er et sted der «lønn og goder» også betyr om stedet tar deg på alvor som et liv, ikke som en time. Sladderen vil av og til si det fine avtalene ikke gjør: at de sparer på deg.

Spør. Sammenlign. Og se kulturen samtidig. En god pensjon i et dårlig hus er likevel år av livet ditt i det huset.`,
  },
  {
    slug: "tariff",
    query: "tariff",
    topic: "rettigheter",
    mood: "problem",
    title: "Tariff: du aner ikke om du er beskyttet eller bare håpefull",
    excerpt: "Du aner ikke om du er beskyttet, eller bare håpefull.",
    body: `Tariff høres ut som noe for andre. Så kommer en konflikt, en turnus, en lønnssamtale, og plutselig er det ditt liv som står i et hefte du ikke har åpnet. Du googler fordi du ikke vil være naiv, og fordi du ikke vil være «sånn».

Å ville tariff er ikke å ville krig. Det er å ville at spillereglene skal være skrevet ned.

Min Arbeidsplass erstatter ikke fagforeningen. Vi kan vise om folk opplever rettferdighet, ledelse og lønn som anstendig. Det er ofte der du kjenner om tariffen lever i praksis eller bare på et medlemskort.

Håpet vårt er at du skal tørre å spørre. Et sted som blir surt av spørsmålet, har svart.`,
  },
  {
    slug: "fast-stilling",
    query: "fast stilling",
    topic: "vilkar",
    mood: "glede",
    title: "Fast stilling er mer enn et ord i en kontrakt",
    excerpt: "Du vil bare vite at noen vil ha deg også etter sommeren.",
    body: `Fast stilling er trygghet i et land som later som alle har den. For mange er den en lengsel: å få puste ut, tegne bolig, kjøpe en sofa uten å regne på vikariatet. Gleden er ekte når den kommer. Så er skuffelsen når «fast» likevel betyr evig usikkerhet i omorganiseringer.

Du googler ordet fordi du vil at noen skal ville deg tilbake.

Min Arbeidsplass kan ikke faste deg. Vi kan vise om stedet behandler folk som permanente eller som poster. Kåring, sladder, undersøkelse — spor etter om «vi investerer i folk» er sant.

Når du får det faste, feir. Når du vurderer et sted, se om de som er der, faktisk anbefaler å bli.`,
  },
  {
    slug: "vikariat",
    query: "vikariat",
    topic: "vilkar",
    mood: "problem",
    title: "Vikariat: du presterer som fast og sover som om du kan miste alt",
    excerpt: "Du presterer som om du er fast, og sover som om du kan miste alt.",
    body: `Vikariatet har en utløpsdato som sitter i kroppen. Du tar vakter. Du smiler. Du sier ja. Du googler likevel, fordi håpet om forlengelse er blitt en livsstil.

Å være midlertidig kan være en dør. Det kan også være en forretningsmodell.

Min Arbeidsplass håper å synliggjøre stedene som bruker vikarer som bro, og stedene som bruker dem som møbler. Folk som har vært der, vet forskjellen. La dem si det.

Gjør jobben skikkelig. Skyld ikke å måtte være takknemlig for usikkerhet i årevis. Et sted som vil deg, viser det i mer enn en ny tre måneders kontrakt.`,
  },
  {
    slug: "ufrivillig-deltid",
    query: "ufrivillig deltid",
    topic: "vilkar",
    mood: "problem",
    title: "Ufrivillig deltid: du vil mer, men noen har bestemt at du ikke får",
    excerpt: "Du vil jobbe mer, men noen har bestemt at du ikke får lov.",
    body: `Ufrivillig deltid er fattigdom med timeplan. Du er «fleksibel» i systemets favør. Du googler fordi du er lei av å be om mer og få smil. Lei av å stable jobber. Lei av å være takknemlig for smuler.

Dette er ikke et privat unnlatelsessynd. Det er organisering.

Min Arbeidsplass vil at slike mønstre skal kunne leses før du takker ja: kultur, lønn og goder, sladder om vakter som aldri blir hele. Vi erstatter ikke loven. Vi gir deg vitner.

Du har rett til å ville en hel stilling og et helt liv. Ikke la noen fortelle deg at det er grådig.`,
  },
  {
    slug: "permittering",
    query: "permittering",
    topic: "vilkar",
    mood: "problem",
    title: "Permittering: du sjekker telefonen oftere enn du vil innrømme",
    excerpt: "Du sjekker telefonen oftere enn du vil innrømme.",
    body: `Permittering er venting i arbeidstøy. Du er ikke sagt opp, og du er ikke i fred. Nyhetene, gruppa, spekulasjonene. Du googler for å forstå hva du har krav på, og for å ha noe å gjøre med angsten.

Det er lov å være redd. Det er lov å være sint.

Min Arbeidsplass kan ikke stoppe markedet. Vi kan huske hvordan stedene håndterer folk når det blåser: med verdighet eller med stillhet. Det sporene etter slike runder er verdt å lese før du går inn i neste «familie».

Hold deg nær dem du stoler på. Når du skal videre, velg etter mer enn logoen som en gang permitterte pent — eller stygt.`,
  },
  {
    slug: "nedbemanning",
    query: "nedbemanning",
    topic: "vilkar",
    mood: "problem",
    title: "Nedbemanning: du sitter i allmøtet og leser ansikter",
    excerpt: "Du sitter i allmøtet og prøver å lese ansiktene.",
    body: `Nedbemanning har et språk av «krevende, men nødvendig». I kroppen er det jakt. Hvem. Når. Hvorfor jeg. Du googler mellom møtene, med et ansikt som later som du følger med på slidene.

Noen runder er reelle. Noen er kultur som endelig viser tennene.

Min Arbeidsplass håper at stedets historie skal være lesbar: hvordan ledelse scorer, hva de som gikk sa, om arbeidsgiver senere svarer uten å slette. Innsikt skal ikke kunne viskes ut fordi det ble et vanskelig kvartal.

Hvis du overlever runden, vær snill med deg selv. Overlevelse er ikke seier. Hvis du ikke gjør det, er du ikke et kutt. Du er et menneske som skal finne et sted som vil deg.`,
  },
  {
    slug: "sluttavtale",
    query: "sluttavtale",
    topic: "vilkar",
    mood: "problem",
    title: "Sluttavtale: de tilbyr penger for at du skal gå stille",
    excerpt: "De tilbyr penger for at du skal gå stille.",
    body: `Sluttavtalen kommer i et møterom med vann i glass. Den kan være anstendig. Den kan være en pris på stillheten din. Du googler fordi du ikke vet hva som er normalt, og fordi du er redd for å signere feil i sjokk.

Ta med noen. Ta tid. Penger er ikke det samme som fred.

Min Arbeidsplass er ikke juridisk rådgivning. Vi er et sted der du etterpå — når du kan — kan legge igjen hvordan det opplevdes, så neste person ikke går inn naiv. Kåringen bruker tidligere jobber nettopp for slike kapitler.

Signer ikke for å være grei. Vær grei mot deg selv. Så la sporene, når du er klar, gjøre arbeidsplassen mer sann.`,
  },
  {
    slug: "oppsigelsestid",
    query: "oppsigelsestid",
    topic: "vilkar",
    mood: "problem",
    title: "Oppsigelsestid: du er ferdig, kalenderen sier tre måneder",
    excerpt: "Du er allerede emosjonelt ferdig, men kalenderen sier tre måneder.",
    body: `Oppsigelsestid er en merkelig limbo. Du har sagt det, eller de har sagt det, og likevel sitter du der med tilgangskortet. Folk snakker rart. Du googler om du må, om du kan avkorte, om det er normalt at det kjennes så flaut.

Det er normalt. Det er også tungt.

Min Arbeidsplass håper du bruker limboen til to ting: å være anstendig, og å være ærlig når du er ute. Undersøkelsen for stedet du forlater, er en av de mest verdifulle gavene du kan gi neste søker.

Gå ferdig. Gå oppreist. Og gå mot noe du har sjekket, ikke bare mot døra.`,
  },
  {
    slug: "konkurranseklausul",
    query: "konkurranseklausul",
    topic: "vilkar",
    mood: "problem",
    title: "Konkurranseklausul: du er redd for at CV-en din eies av noen andre",
    excerpt: "Du er redd for at CV-en din eies av noen andre.",
    body: `Konkurranseklausul høres ut som noe for direktører. Så står den der i kontrakten du signerte glad i mai. Nå vil du videre, og plutselig eier de nabolaget ditt, kundene dine, kanskje faget ditt.

Les. Spør. Ikke skam deg over å ha oversett det. Mange har.

Min Arbeidsplass kan ikke stryke klausulen. Vi kan la folk fortelle om steder som binder, og steder som slipper. Det hører hjemme i sladder og i hvordan arbeidsgiver faktisk oppfører seg når noen går.

Fremtiden din skal ikke være en bisetning. Sjekk neste kontrakt som om du allerede var lei — fordi en dag er du det, og da skal du være fri.`,
  },
  {
    slug: "innleid",
    query: "innleid",
    topic: "vilkar",
    mood: "problem",
    title: "Innleid: du gjør samme jobb, men hører aldri med i «vi»",
    excerpt: "Du gjør samme jobb, men hører aldri med i «vi».",
    body: `Innleid er å være nødvendig og utenfor. Du sitter i samme møte, drikker samme kaffe, og blir likevel en post. Julebordet er uklart. Utviklingen likeså. Du googler fordi du kjenner deg som en gjest i ditt eget arbeid.

Noen oppdrag er fine og tydelige. Noen er et hull i arbeidsgiveransvaret.

Min Arbeidsplass vil at både byrået og stedet du sitter, skal kunne søkes opp. Hvordan er det å være der. Hvem bærer deg. Hvem bruker deg.

Du er ikke mindre verdt fordi fakturaen går en annen vei. Velg oppdrag etter kultur, ikke bare etter timepris.`,
  },
  {
    slug: "bemanningsbyra",
    query: "bemanningsbyrå",
    topic: "vilkar",
    mood: "problem",
    title: "Bemanningsbyrå: mellomparkering som kan bli et liv",
    excerpt: "Du skulle bare innom, og så ble usikkerheten hverdagen.",
    body: `Bemanningsbyrå kan være en bro inn i faget. Det kan også være evig mellomparkering. Du googler når du er lei av å være «ute», lei av å selges inn, lei av å smile til nye lag hver høst.

Byråer er ulike. Oppdragene likeså. Det er poenget.

Søk dem opp på Min Arbeidsplass. Les hvordan folk beskriver ledelse og trygghet. Ikke bare hva de lover i en rekrutteringssamtale. Vi håper å gjøre byråene like synlige som de store merkene de leier ut til.

Du fortjener mer enn neste oppdrag. Du fortjener å vite hvordan det er å ha dem i ryggen.`,
  },
  {
    slug: "konsulentlivet",
    query: "konsulent",
    topic: "bransje",
    mood: "problem",
    title: "Konsulentlivet: ekspert overalt og hjemme ingen steder",
    excerpt: "Du er ekspert overalt og hjemme ingen steder.",
    body: `Konsulentlivet selges som læring og frihet. Ofte er det flyplasser, nye koder, nye lunsjer og en følelse av at du aldri blir. Du googler når du er stolt og sliten i samme åndedrag.

Gleden er ekte når oppdraget betyr noe. Tomheten er ekte når du bare er en linje på et budsjett.

Min Arbeidsplass vil at konsulentselskapene skal kåres av folk som har levd det, ikke av pitch. Verktøyundersøkelsen sier noe om hverdagen. Arbeidsplassundersøkelsen sier noe om om du blir holdt.

Hvis du elsker det, si hvorfor. Hvis du vil hjem, finn ut hvilke hus som faktisk har en dør.`,
  },
  {
    slug: "varsling",
    query: "varsling",
    topic: "rettigheter",
    mood: "problem",
    title: "Varsling: du vet hva som er galt, og du er redd for prisen",
    excerpt: "Du vet hva som er galt, og du er redd for prisen av å si det.",
    body: `Varsling er mot og natt. Du har sett noe. Du har en plikt, og du har en familie. Du googler fremgangsmåten, vernet, historiene om dem det gikk galt med. Hjertet banker i et tomt møterom i hodet ditt.

Loven er der. Kulturen avgjør om den lever.

Min Arbeidsplass er ikke varslingskanalen. Vi er et sted der mønstre kan synes før det blir en sak, og der de som har gått, kan si hvordan det var å si ifra. Arbeidsgiver kan svare. De kan ikke slette.

Ta vare på deg selv. Ta vare på bevisene. Og vit at du ikke er den første som har sittet med den setningen i halsen.`,
  },
  {
    slug: "diskriminering-pa-jobb",
    query: "diskriminering på jobb",
    topic: "rettigheter",
    mood: "problem",
    title: "Diskriminering på jobb: du er «for mye» av noe du ikke kan skru av",
    excerpt: "Du får høre at du er «for mye» av noe du ikke kan skru av.",
    body: `Diskriminering er sjelden et skilt på døra. Det er hvem som får de synlige oppgavene. Hvem som blir avbrutt. Hvem som må være hyggeligere for å få samme tillit. Du googler for å sjekke om du innbiller deg det. Du innbiller deg det sjelden.

Det sliter å bære både jobben og forklaringen.

Min Arbeidsplass håper å gi rom for at slike erfaringer kan sies uten at du først må bli en sak. Kultur og ledelse i kåringen. Sladder på bedriftssiden. Kommentarer her, innlogget, med et navn du velger.

Du skal ikke skru av deg selv for å få lønn. Finn steder der folk som ligner deg, faktisk blir — og der de anbefaler andre å komme.`,
  },
  {
    slug: "likestilling-arbeidsliv",
    query: "likestilling arbeidsliv",
    topic: "rettigheter",
    mood: "glede",
    title: "Likestilling i arbeidslivet er hvem som får snakke ferdig",
    excerpt: "Du teller hvem som snakker, og hvem som blir avbrutt.",
    body: `Likestilling er ikke en pris i resepsjonen. Den er møtet. Lønna. Hvem som går hjem når barnet er sykt uten å bli et problem. Du googler både i sinne og i håp — fordi du har sett det virke, og fordi du har sett det late som.

Gleden ved et lag der folk får være hele, er verdt å jakte på.

Min Arbeidsplass vil at den gleden skal synes i kultur og ledelse, og at gapet skal synes like tydelig. Vi håper arbeidsgivere leser innsikt de ikke kan pynte vekk.

Tell gjerne. Så velg med tallene og magen. Et likestilt sted kjennes i kroppen som luft.`,
  },
  {
    slug: "glasstak",
    query: "glasstak",
    topic: "rettigheter",
    mood: "problem",
    title: "Glasstak: du ser toppen, du får bare aldri nøkkelen",
    excerpt: "Du ser toppen. Du får bare aldri nøkkelen.",
    body: `Glasstaket er gjennomsiktig, derfor gaslighter det deg. Du er jo «nesten». Du er jo «i løypa». Så går nøkkelen til noen som ligner dem som allerede sitter der. Du googler ordet i en kveld der skrytet og stansen ikke går opp.

Det er ikke innbilning. Det er mønster.

Min Arbeidsplass kan ikke knuse taket. Vi kan la mønsteret beskrives: hvem som utvikles, hvem som anbefaler, hvordan ledelsen oppleves av dem som ikke ble invitert inn.

Bli ikke mer «strategisk». Bli mer kresen. Neste sted skal du spørre hvem som faktisk rykker opp — og lese hva folk som gikk, sa.`,
  },
  {
    slug: "aldersdiskriminering",
    query: "aldersdiskriminering",
    topic: "rettigheter",
    mood: "problem",
    title: "Aldersdiskriminering: du er for dyr eller for fersk, aldri passe",
    excerpt: "Du er «for dyr» eller «for fersk», aldri akkurat passe.",
    body: `Alder på jobb er et rom du ikke får lov å innrede selv. For ung til å bli tatt på alvor. For gammel til å bli satset på. Du googler når du kjenner at det ikke er kompetansen som vurderes, men fødselsåret.

Det er nedverdigende, og det er vanlig.

Min Arbeidsplass håper å gjøre slike kulturer lesbare. Utvikling, ledelse, sladder om hvem som får kurs og hvem som får «takk for innsatsen».

Du er ikke utgått på dato. Du er et menneske i et tall. Finn stedene der erfaring er gull, og der de unge får mikrofonen uten å måtte be om unnskyldning.`,
  },
  {
    slug: "innvandrer-jobb-norge",
    query: "innvandrer jobb Norge",
    topic: "rettigheter",
    mood: "problem",
    title: "Innvandrer i norsk arbeidsliv: overkvalifisert på papiret, usynlig i praksis",
    excerpt: "Du er overkvalifisert på papiret og usynlig i praksis.",
    body: `Du har papirene. Du har språket, eller du sliter med språket og er tre ganger så dyktig. Likevel er det et gap mellom intervjuet og rommet. Du googler fordi du vil vite om det er Norge, eller om det er denne arbeidsplassen.

Begge kan være sant. Det siste kan du velge bort oftere enn du tror.

Min Arbeidsplass vil at kultur skal beskrives av dem som har kjent den på kroppen, ikke av mangfoldsstrategier. Søk opp stedet. Les. Kommenter når du tør.

Du skal ikke måtte være takknemlig for å få bruke kompetansen din. Et sted som vil Norge som det faktisk ser ut, vil deg.`,
  },
  {
    slug: "tillitsvalgt",
    query: "tillitsvalgt",
    topic: "rettigheter",
    mood: "glede",
    title: "Tillitsvalgt: noen må tørre, og det ble deg",
    excerpt: "Noen må tørre, og det ble deg.",
    body: `Tillitsvalgt er en rolle folk tar fordi de er lei av at ingen tar den. Den kan være stolthet, fellesskap, mening. Den kan også være ensomhet mot et lederbord. Du googler for å gjøre det rett, og for å tåle det.

Gleden ved å bære andre er ekte. Prisen skal ikke være at du blir straffet for det.

Min Arbeidsplass håper å vise om stedet respekterer de som sier ifra, eller om de blir «vanskelige». Det synes i ledelse og kultur. Det synes i sladder.

Hvis du har et lag i ryggen, si det. Hvis du står alene, er du likevel ikke alene i landet. Vi leser deg.`,
  },
  {
    slug: "fagforening",
    query: "fagforening",
    topic: "rettigheter",
    mood: "glede",
    title: "Fagforening uten å bli sett på som vanskelig",
    excerpt: "Du vil ha ryggen dekket uten å bli sett på som vanskelig.",
    body: `Fagforening er for mange et stille ja i et skjema, og for noen et stempel de er redde for. Du googler fordi du vil ha vern, og fordi kulturen der du er, har gjort vern til noe mistenkelig.

Et sted som straffer organisering, har fortalt deg hvordan de ser på makt.

Min Arbeidsplass erstatter ikke foreningen. Vi kan vise hvordan det oppleves å være ansatt der: om lønn og goder scorer, om ledelsen tåler motstand, om folk anbefaler å bli.

Bli medlem der det gir mening. Velg arbeidsplass der det ikke koster deg huden.`,
  },
  {
    slug: "stillingsannonser",
    query: "stillingsannonser",
    topic: "sok",
    mood: "problem",
    title: "Stillingsannonser lyver pent mellom linjene",
    excerpt: "Du leser mellom linjene, fordi teksten lyver pent.",
    body: `Stillingsannonser er litteratur. «Tempo». «Familie». «Hands-on». «Utviklingsmuligheter». Du har lært deg å oversette, og likevel håper du. Du googler for å sjekke om det du leser, finnes i virkeligheten.

Det er sunt. Det er også utmattende.

Min Arbeidsplass er den andre teksten. Søk opp organisasjonsnummeret. Les kåring, sladder, score. Vi håper å gjøre oversettelsen kortere, så du slipper å bruke tre runder på å oppdage at «familie» betydde at du aldri går hjem.

Søk. Men les stedet, ikke bare diktet om stedet.`,
  },
  {
    slug: "jobbsoknad",
    query: "jobbsøknad",
    topic: "sok",
    mood: "problem",
    title: "Jobbsøknad: du former deg etter dem, og lurer på om du er igjen",
    excerpt: "Du former deg etter dem, og lurer på om det er noe igjen av deg.",
    body: `Jobbsøknaden er et lite skuespill. Du stryker kantene. Du bruker deres ord. Etter fem stykker kjenner du deg som en mal. Du googler for å gjøre det «riktig», mens du egentlig vil spørre: vil de ha meg, eller en pent brettet versjon?

Det er lov å tilpasse. Det er farlig å forsvinne.

Min Arbeidsplass vil at du skal velge hvem du søker til med mer enn et håp. Hvis stedet scorer dårlig på kultur, er det ikke sikkert at du skal bli mer som dem.

Skriv ærlig nok til at du tåler å få jobben. Det er den eneste søknaden som ikke straffer deg senere.`,
  },
  {
    slug: "cv-tips",
    query: "CV",
    topic: "sok",
    mood: "problem",
    title: "CV: et liv på to sider, og håpet om at det er nok",
    excerpt: "Du presser et liv inn i to sider og håper det er nok.",
    body: `CV-en er et hardt dokument. År blir kuler. Savn blir hull. Du googler maler mens du egentlig googler «er jeg nok». Det er et vondt søk kledd som et praktisk.

På Min Arbeidsplass kan du legge inn CV og nåværende arbeidsplass for å styre hva du kan si ærlig om. Offisiell kåring er for tidligere jobber. Det er et vern, ikke et hinder.

La CV-en være presis. La valget av arbeidsplass være like presist. To sider kan åpne en dør. De kan ikke redde deg fra et hus som er kaldt.

Du er mer enn dokumentet. Velg steder som skjønner det.`,
  },
  {
    slug: "jobbintervju",
    query: "jobbintervju",
    topic: "sok",
    mood: "problem",
    title: "Jobbintervju: du smiler så det gjør vondt",
    excerpt: "Du smiler så det gjør vondt, og prøver å gjette hva de egentlig vil høre.",
    body: `Intervjuet er en audition der de har scriptet og du har kaffe i halsen. Du vil være likandes. Du vil være skarp. Du vil ikke være desperat. Du googler spørsmål, og glemmer å intervjue dem tilbake.

De skal også velges.

Min Arbeidsplass håper du går inn i rommet med mer enn magefølelsen: hvordan scorer stedet, hva sier de som har sluttet, matcher det måten du vil jobbe på.

Smil gjerne. Still de stygge, voksne spørsmålene også. Et sted som tåler dem, tåler deg.`,
  },
  {
    slug: "referanser-jobb",
    query: "referanser jobb",
    topic: "sok",
    mood: "problem",
    title: "Referanser: du ber en gammel sjef om å redde deg",
    excerpt: "Du ber en gammel sjef om å redde deg, og håper de husker deg pent.",
    body: `Referanser er merkelig makt. Noen som kjente deg i en annen tid, skal åpne eller stenge. Du googler hva som er lurt, mens du egentlig håper at de ikke husker den ene uka du var et menneske.

Gode referanser er glede. Dårlige arbeidsplasser gjør referansen til et gissel.

Min Arbeidsplass gir deg et annet spor: ikke bare hva en sjef sier om deg, men hva mange sier om stedet. Det er en sunnere asymmetri.

Velg referanser som har sett deg. Velg arbeidsplasser som ikke trenger å eie ettermælet ditt.`,
  },
  {
    slug: "finn-jobb",
    query: "finn jobb",
    topic: "sok",
    mood: "problem",
    title: "Finn jobb uten å bli mer verdiløs for hvert treff",
    excerpt: "Du scroller i timevis og kjenner deg mer verdiløs for hvert treff.",
    body: `Å finne jobb er blitt en sport i å tåle avvisning fra roboter. Du scroller, tilpasser, sender, venter. Hvert treff som ikke svarer, legger seg i brystet. Du googler «finn jobb» som om det fantes en dør som ikke var en trakt.

Det finnes dører. De er bare dårlig merket.

Min Arbeidsplass snur søket: ikke bare «hvilken stilling», men «hvilket hus». Når du har et navn, slå det opp. Når du ikke har det, les artikler, kåring og sladder til magen kjenner igjen noe.

Du er ikke verdiløs fordi markedet er støyete. Du er i et støyete marked. Velg med mer enn desperasjon. Desperasjon signerer dårlige kontrakter.`,
  },
  {
    slug: "nav-ledige-stillinger",
    query: "NAV ledige stillinger",
    topic: "sok",
    mood: "problem",
    title: "NAV og ledige stillinger: å trenge hjelp skal ikke definere deg",
    excerpt: "Du er redd for at det å trenge hjelp skal definere deg.",
    body: `NAV-søket kommer med en klump. Ikke fordi du er lat, men fordi skammen er innøvd. Du vil ha jobb. Du vil også ha verdighet. De to skal ikke være i konflikt, og likevel kjennes de slik.

Ledige stillinger er en liste. Et liv er ikke en liste.

Min Arbeidsplass håper å gi deg et lag under listene: hvordan det er å jobbe der du søker, ikke bare at det finnes et hull. Bruk oss ved siden av NAV, ikke i stedet for.

Du er ikke en sak. Du er et menneske i overgang. Velg steder som behandler deg som det, også før du er «i mål».`,
  },
  {
    slug: "tegn-pa-at-du-bor-slutte",
    query: "tegn på at du bør slutte",
    topic: "karriere",
    mood: "problem",
    title: "Tegn på at du bør slutte, kroppen sa ifra først",
    excerpt: "Kroppen sa ifra lenge før hodet turte.",
    body: `Listene finnes: du sover dårlig, du er irritert, du teller dager, du hater søndag, du blir noen andre. Du googler dem for å få lov. Hodet vil ha fem tegn. Kroppen har hatt tretti.

Du trenger ikke en perfekt begrunnelse for å gå.

Min Arbeidsplass er et speil, ikke en dommer. Hvis scoren, sladderen og magen peker samme vei, er det nok. Hvis gleden fortsatt er der under slitet, kan det være verdt å kjempe — men ikke alene mot et hus som ikke vil kjempe med deg.

Lytt. Så gå mot noe du har sjekket, ikke bare vekk fra det som gjør vondt.`,
  },
  {
    slug: "hvorfor-slutte-i-jobben",
    query: "hvorfor slutte i jobben",
    topic: "karriere",
    mood: "problem",
    title: "Hvorfor slutte i jobben når utmattelse «ikke er en grunn»",
    excerpt: "Du leter etter en gyldig grunn, som om utmattelse ikke var nok.",
    body: `Du leter etter en grunn som ser bra ut i et intervju. «Nye utfordringer». «Karriere». Sannheten er at du er ferdig. Det er en gyldig grunn. Den er bare dårlig kledd for LinkedIn.

Du skylder ikke å bli til du går i stykker. Det er ikke profesjonelt. Det er sløsing med et liv.

Min Arbeidsplass håper å gi deg språket og dataene: dette stedet sliter folk, dette stedet løfter. Når du slutter, ta undersøkelsen. Det er en grunn som hjelper andre, ikke bare en setning som pynter deg.

Gå med ærlighet i magen og pent språk utad hvis du må. Inni deg får utmattelsen lov å være nok.`,
  },
  {
    slug: "drommejobben",
    query: "drømmejobben",
    topic: "karriere",
    mood: "glede",
    title: "Drømmejobben kan også bare være en jobb",
    excerpt: "Du er redd for å nå den og oppdage at den også er bare en jobb.",
    body: `Drømmejobben er et farlig ord. Den bærer for mye. Når du får den, kan skuffelsen bli skam: jeg skulle jo være lykkelig. Når du ikke får den, blir alt annet nesten.

Gleden ved et sted som passer, er mer pålitelig enn drømmen.

Min Arbeidsplass vil senke magien og heve sannheten. Person–miljø-fit, kåring, sladder: er dette et sted der folk som deg puster. Drømmen kan leve. Den skal bare ikke få lov å lyve.

Jakt gjerne. Sjekk huset. En drøm med dårlig ledelse er et mareritt med fin tittel.`,
  },
  {
    slug: "jobbe-i-staten",
    query: "hvordan er det å jobbe i staten",
    topic: "bransje",
    mood: "problem",
    title: "Jobbe i staten: mening og pensjon, eller et system som sluker deg",
    excerpt: "Du vil ha mening og pensjon, ikke et system som sluker deg.",
    body: `Staten tiltrekker folk som vil noe større enn kvartalet. Det er vakkert. Det kan også være labyrint, tempo uten takk, og en lojalitet som går én vei. Du googler fordi du vil vite om hverdagen matcher oppdraget.

Den gjør det noen steder. Ikke overalt.

Min Arbeidsplass skiller virksomheter med organisasjonsnummer, ikke med en myte om «det offentlige». Søk opp etaten, direktoratet, selskapet. Les hvordan ledelse og balanse scorer der, ikke i staten som idé.

Hvis du har funnet mening i det offentlige, si det. Hvis du har druknet, si det. Begge deler er sanne Norge.`,
  },
  {
    slug: "kommune-jobb",
    query: "kommune jobb",
    topic: "bransje",
    mood: "problem",
    title: "Kommunejobb: du vil tjene folk, ikke drukne i avvik",
    excerpt: "Du vil tjene folk, ikke drukne i avvik og vikariater.",
    body: `Kommune er nabolaget, skolen, hjemmetjenesten, plan, vann, alt som holder hverdagen. Gleden ved å være nær folk er ekte. Så er slitasjen i lister som ikke går opp. Du googler «kommune jobb» både i kall og i varsko.

Kommuner er ulike. Det er hele poenget.

Slå opp kommunen og enhetene på Min Arbeidsplass. Vi håper at kåringen skal tørre å vise at noen kommuner holder folk, og at noen brenner dem ut — uten at det blir en nasjonal klisje.

Tjen gjerne. Bare ikke forsvinn i tjenesten. Du er også innbygger i ditt eget liv.`,
  },
  {
    slug: "offentlig-vs-privat",
    query: "offentlig vs privat",
    topic: "bransje",
    mood: "problem",
    title: "Offentlig versus privat: du bytter sektor og håper magen roer seg",
    excerpt: "Du bytter sektor og håper at magen skal roe seg.",
    body: `Debatten offentlig mot privat er høy og ofte uærlig. Du står i den med en kropp. Du vil ha tempo, eller du vil ha mening, eller du vil bare ha fred. Du googler for å få et kart. Kartene er fulle av politikk.

Arbeidsplasser er fulle av mennesker.

Min Arbeidsplass bryr seg om org.nr., ikke om ideologi. Et privat sted kan være varmt. Et offentlig kan være kynisk. Omvendt. Les stedet.

Bytt hvis du må. Bytt mot data, ikke mot et rykte om at gresset er mer effektivt eller mer etisk på den andre siden.`,
  },
  {
    slug: "liten-bedrift-jobb",
    query: "liten bedrift jobb",
    topic: "bransje",
    mood: "problem",
    title: "Liten bedrift: dere er familie, helt til det ikke lenger passer",
    excerpt: "Dere er familie, helt til det ikke lenger passer.",
    body: `Små steder kan være de beste: korte veier, synlig arbeid, kake når det er bursdag. De kan være de verste: én persons humør, ingen HR, lojalitet som gissel. Du googler fordi du vil ha nærhet, og fordi du er redd for den.

Begge instinktene er kloke.

Min Arbeidsplass tar de små like alvorlig som de store. Sladderen betyr enda mer når det ikke finnes 400 anonyme svar. Vi håper tre ærliges stemmer skal kunne vise et mønster uten å henge ut naboen.

Gå inn i det lille med åpne øyne. Nærhet er glede. Nærhet uten vern er noe annet.`,
  },
  {
    slug: "stor-bedrift-jobb",
    query: "stor bedrift jobb",
    topic: "bransje",
    mood: "problem",
    title: "Stor bedrift: stolt av logoen, usynlig i gangen",
    excerpt: "Du er stolt av logoen, og usynlig i gangen.",
    body: `De store har pensjon, merkevare og kantine. De har også lag på lag før noen hører deg. Du googler fordi du vil ha tyngden, og fordi du er redd for å bli et nummer.

Prestisje er en dårlig dyne.

Min Arbeidsplass kårer uansett størrelse, med samme spørsmål. Det er et poeng. En kjempe kan være den beste arbeidsplassen i landet, eller en maskin. Folk som har sluttet, vet hva logoen kostet.

Vær stolt hvis stedet fortjener det. Vær synlig for deg selv, også når gangen er lang.`,
  },
  {
    slug: "startup-jobb",
    query: "startup jobb",
    topic: "bransje",
    mood: "problem",
    title: "Startup: redde verden på overtid og usikker lønn",
    excerpt: "Dere skal redde verden, på overtid og usikker lønn.",
    body: `Startup lukter håp. Det er derfor det gjør så vondt når håpet blir 80 timer og en lønn som «kommer når vi henter». Du googler fordi du vil være med, og fordi du ikke vil bli lurt av misjonen.

Misjon er ikke lederskap. Egenkapital er ikke søvn.

Min Arbeidsplass vil at også de små, raske selskapene skal kunne søkes opp og beskrives. Kultur bygges tidlig. Sladderen fra dem som brant, er en gave til dem som ennå er tent.

Hvis gleden er ekte, fly. Hvis den bare er FOMO, les før du hopper. Verden kan reddes uten at du ofres.`,
  },
  {
    slug: "it-jobb-norge",
    query: "IT jobb Norge",
    topic: "bransje",
    mood: "problem",
    title: "IT-jobb i Norge: lønna lokker, kulturen er det ingen som lover",
    excerpt: "Lønna lokker. Kulturen er det ingen som lover.",
    body: `IT-Norge er fullt av stillinger og myter. Høy lønn. Hjemmekontor. «Kult». Så sitter du i et Jira-bord og kjenner deg som i hvilken som helst annen etat, bare med bedre kaffe. Du googler for å skille de tekniske drømmene fra de menneskelige.

Verktøy betyr noe. Mennesker betyr mer.

Derfor har Min Arbeidsplass både arbeidsplassundersøkelse og verktøyundersøkelse. Den siste teller ikke i kåringen. Den forteller likevel om hverdagen: hyllevare eller kaos, tidstyver, systemer som ikke snakker.

Ta lønna. Ta også pulsen. En teknisk lek i et dårlig lag blir fort en dyr måte å bli lei på.`,
  },
  {
    slug: "sykepleier-jobb",
    query: "sykepleier jobb",
    topic: "bransje",
    mood: "problem",
    title: "Sykepleier: du ble det for å hjelpe, ikke for å gå tom",
    excerpt: "Du ble sykepleier for å hjelpe, ikke for å gå tom.",
    body: `Sykepleie er kall inntil det er matematikk som ikke går opp. Du googler i en pause du ikke har, med sko som gjør vondt, og et hjerte som fortsatt vil. Gleden ved å holde noen er ekte. Tomheten etter for mange vakter er det også.

Du er ikke svak fordi du er sliten. Du er i et system.

Min Arbeidsplass vil at sykehus, kommuner og private aktører skal kunne skilles. Noen holder folk. Noen lever av at folk tåler for mye. La kåring og sladder vise det, uten at det blir enda en generell sykepleierkrise uten navn.

Hjelp. Så krev å bli hjulpet av huset du jobber i.`,
  },
  {
    slug: "laerer-jobb",
    query: "lærer jobb",
    topic: "bransje",
    mood: "problem",
    title: "Lærer: du elsker elevene. Systemet elsker ikke deg tilbake",
    excerpt: "Du elsker elevene. Systemet elsker ikke deg tilbake.",
    body: `Læreryrket googles av folk som vil inn, og av folk som vil overleve året. Elevene er lyset. Møtene, mappene, bemanningen er skyggen. Du skammer deg over å klage, fordi barna fortjener deg. Du fortjener også å sove.

Skoler er ulike. Kommuner er ulike. Rektorer er ulike.

Min Arbeidsplass håper å gjøre de forskjellene synlige. Ikke «skolen i Norge». Denne skolen. Denne ledelsen. Denne kulturen.

Hvis du fortsatt har gleden, vern den. Hvis den er i ferd med å bli borte, er det et varsel, ikke et svik mot klassen.`,
  },
  {
    slug: "ingenior-jobb",
    query: "ingeniør jobb",
    topic: "bransje",
    mood: "problem",
    title: "Ingeniør: du løser komplekse ting, og lurer på menneskene rundt",
    excerpt: "Du løser komplekse ting, og lurer på om menneskene rundt deg er like gjennomtenkte.",
    body: `Ingeniørjobben kan være skjønnhet i problem. Den kan være et excel-liv i et prosjekt som aldri lander, med en leder som ikke forstår faget og likevel styrer det. Du googler for å finne steder der kvaliteten får lov å bety noe.

Faglig stolthet er glede. Den dør i slarv.

Min Arbeidsplass har utvikling og kultur som egne spor, og verktøyundersøkelse for dem som vil vite om CAD, GIS og kjernesystem er til å leve med. Vi håper det skal bli lettere å velge et lag som tar faget på alvor.

Bygg gjerne. Bygg ikke deg selv i stykker for et prosjekt som glemmer deg når det åpnes.`,
  },
  {
    slug: "lederjobb",
    query: "lederjobb",
    topic: "ledelse",
    mood: "problem",
    title: "Lederjobb: du fikk tittelen og mistet noen å være ærlig med",
    excerpt: "Du fikk tittelen, og mistet noen å snakke ærlig med.",
    body: `Lederjobben ser ut som ankomst. Ofte er den avgang fra kollegiet. Du skal bære tall, folk og en strategi du ikke alltid tror på. Du googler i et rom der du ikke lenger kan si alt.

God ledelse er glede. Dårlig ramme rundt en ny leder er ensomhet.

Min Arbeidsplass ser også ledernes arbeidsplass. Hvordan scorer stedet på kultur. Hva sier de som har hatt rollen. Fit: vil du egentlig styre, eller ble du den som sa ja.

Ta rollen hvis den er din. Ta den ikke som flukt oppover fra et sted du burde forlatt sidelengs.`,
  },
  {
    slug: "servicejobb",
    query: "servicejobb",
    topic: "bransje",
    mood: "problem",
    title: "Servicejobb: kunden har alltid rett, ryggen har alltid vondt",
    excerpt: "Kunden har alltid rett, og ryggen din har alltid vondt.",
    body: `Service er ansiktet Norge møter, og kroppen som bærer det. Du googler etter vakter, etter sjefen, etter om det er normalt at du ikke får sitte. Gleden ved folk er ekte. Slitasjen er det også.

Butikk, kafé, hotell, kundesenter — ulike hus, samme spørsmål: blir du sett når kunden er gått?

Min Arbeidsplass vil at også disse stedene skal inn i kåringen, ikke bare kontorene med merkevare. Tre ærliges svar kan flytte et navn. Sladder kan advare mot en kjede som pynter seg.

Du er ikke «bare service». Du er arbeidslivet. Velg sjefer som vet det.`,
  },
  {
    slug: "olje-og-gass-jobb",
    query: "olje og gass jobb",
    topic: "bransje",
    mood: "problem",
    title: "Olje og gass: lønna er høy. Spørsmålet er hva den koster deg",
    excerpt: "Lønna er høy. Spørsmålet er hva den koster deg.",
    body: `Olje og gass googles med kalkulator og samvittighet i samme søk. Rotasjon, lønn, mening, klima, stolthet, skam. Du kan elske faget og hate avstanden. Du kan ta pengene og kjenne deg kjøpt.

Begge deler får plass i et liv. De får ikke lov å lyve om hverdagen.

Min Arbeidsplass bryr seg om hvordan det er å være der: ledelse på plattform og på kontor, balanse, kultur. De store navnene skal tåle ærlighet, ikke bare sponsorater.

Ta valget voksen. Ikke la lønna være den eneste setningen du eier om jobben din.`,
  },
  {
    slug: "konsulentselskap-jobb",
    query: "konsulentselskap",
    topic: "bransje",
    mood: "problem",
    title: "Konsulentselskap: du selges inn som ressurs og kjenner deg som vare",
    excerpt: "Du selges inn som ressurs, og kjenner deg som vare.",
    body: `Konsulentselskapet lover lag og leverer deg ut. Noen ganger er det et håndverk. Noen ganger er du en linje. Du googler for å skille boutique fra kroppsbutikk, læring fra utleie.

Utilisation er ikke en personlighet.

Min Arbeidsplass vil at selskapene skal kåres av dem som har vært ressursen. Hvordan er ledelsen når oppdraget er slutt. Hvordan er kulturen mellom fakturaene.

Hvis du stortrives i faget og laget, si det. Hvis du er trett av å være solgt, er det et signal til neste som vurderer logoen.`,
  },
  {
    slug: "norges-beste-arbeidsplass",
    query: "Norges beste arbeidsplass",
    topic: "karing",
    mood: "glede",
    title: "Norges beste arbeidsplass skal kåres av folk som har vært der",
    excerpt: "Du vil jobbe et sted folk faktisk er stolte av å nevne.",
    body: `«Norges beste arbeidsplass» er et søk fullt av lister som glinser. Noen er betalt. Noen er jury. Noen er kake. Du vil noe enklere og vanskeligere: et sted folk tør å anbefale når de ikke lenger må.

Den gleden er det vi jakter.

Min Arbeidsplass kårer etter arbeidsplassundersøkelsen, med minst tre svar, og bare fra tidligere jobber når det gjelder den offisielle listen. Verktøy, fit og B2B-innsikt rører den ikke. Arbeidsgiver kan svare, ikke slette.

Hvis du har et sted du er stolt av, si det i undersøkelsen. Hvis du leter, start i kåringen og les menneskene bak tallet.`,
  },
  {
    slug: "beste-arbeidsgivere-norge",
    query: "beste arbeidsgivere Norge",
    topic: "karing",
    mood: "problem",
    title: "Beste arbeidsgivere i Norge: hvem betalte for glansen",
    excerpt: "Listene glinser. Du vil vite hvem som betalte for glansen.",
    body: `Beste arbeidsgiver-lister er en industri. Du kjenner det når alle de dyre merkene vinner, og magen din ikke tror på det. Du googler likevel, fordi du vil ha en snarvei.

Snarveien er farlig uten metode.

Vår metode er åpen: syv kategorier, ett snitt, minst tre svar, tidligere arbeidsplass for kåringen. Ingen kjøpt plass. Innsikt til bedrift krever nok unike svar. Negative historier blir.

Bruk listene. Bruk oss hardere. Et merke kan være en god arbeidsgiver. Det skal tåle å vises uten kampanje.`,
  },
  {
    slug: "hvordan-er-det-a-jobbe-der",
    query: "hvordan er det å jobbe der",
    topic: "karing",
    mood: "problem",
    title: "Hvordan er det å jobbe der? Du tør ikke spørre, så du spør Google",
    excerpt: "Du tør ikke spørre kollegaene, så du spør Google.",
    body: `Det er det ærligste søket i norsk arbeidsliv. Hvordan er det å jobbe der. Du står foran et ja, og du vil ikke spørre vennen som jobber der, fordi du ikke vil sette dem i en knipe, og fordi du er redd for svaret.

Google er full av forum og gamle tråder. Vi vil være et sted der svaret har struktur: score, sladder, fit, og mennesker som kommenterer innlogget.

Min Arbeidsplass håper at dette søket skal lande på et org.nr. og et bilde som ikke er karrieresiden. Søk opp bedriften. Les. Spør i kommentarfeltet hvis du er inne.

Du har rett til å vite hvordan det er å være der, før du gir dem dagene dine.`,
  },
  {
    slug: "anonyme-tilbakemeldinger-jobb",
    query: "anonyme tilbakemeldinger jobb",
    topic: "karing",
    mood: "glede",
    title: "Anonyme tilbakemeldinger uten at navnet ditt følger med",
    excerpt: "Du vil lese sannheten uten at navnet ditt følger med.",
    body: `Anonymitet er ikke feighet. Det er ofte det eneste språket som overlever en sjef. Du vil lese det, og du vil skrive det, og du vil ikke miste jobben for et komma.

På Min Arbeidsplass er sladder på bedriftssiden åpent og anonymt. Undersøkelse og kåring krever innlogging, og den offisielle kåringen bruker tidligere jobber. Kommentarer på artikler krever innlogging, så samtalen ikke drukner i støy.

Vi håper å holde begge rommene. Sannhet trenger vern. Den trenger også ansvar når det teller.

Les det anonyme. Bidra når du kan. Det er slik neste person puster lettere.`,
  },
  {
    slug: "arbeidsgiveromdomme",
    query: "arbeidsgiveromdømme",
    topic: "karing",
    mood: "problem",
    title: "Arbeidsgiveromdømme: de forteller hvem de er. De som sluttet, forteller noe annet",
    excerpt: "De forteller deg hvem de er. De som har sluttet, forteller noe annet.",
    body: `Omdømme er det arbeidsgiver eier i kampanjer, og det de ikke eier i kaffen. Du googler merkevaren og får visjoner. Du vil ha ettermælet.

Min Arbeidsplass er bygget som et motstykke til pent omdømme uten innhold. Bedrifter kan svare på innsikt når nok har svart. De kan ikke fjerne det vonde. Ranking er skilt fra B2B, skilt fra verktøy, skilt fra brukernes egne undersøkelser.

Det er et håp om et ærligere marked for arbeid.

Tro på omdømmet når det tåler spor. Tvile når det bare tåler foto.`,
  },
  {
    slug: "finn-en-bedre-arbeidsplass",
    query: "finn en bedre arbeidsplass",
    topic: "karing",
    mood: "glede",
    title: "Finn en bedre arbeidsplass uten å være utakknemlig",
    excerpt: "Du er ikke utakknemlig. Du er ferdig med å late som.",
    body: `Å ville noe bedre er ikke svik. Det er voksenhet. Du kan være takknemlig for det du har lært, og likevel gå. Du kan elske kolleger og hate huset. Du kan ville glede, ikke bare fravær av krise.

Min Arbeidsplass finnes for det øyeblikket. Søk opp stedet du er ferdig med, og stedet du drømmer om. Les kåringen. Ta undersøkelsen når du har gått. Kommenter innlogget hvis du vil være i samtalen.

Håpet vårt er enkelt: at færre skal bære arbeidslivet alene, og at flere skal finne et sted som gjør mandagen til noe annet enn en klump.

Du har lov til å ville bedre. La oss hjelpe deg å se det før du signerer, og å si det når du har levd det.`,
  },
];

export const JOB_ARTICLES = JOB_ARTICLE_SEEDS.map(withMeta);

export function getJobArticleBySlug(slug) {
  return JOB_ARTICLES.find((article) => article.slug === slug) ?? null;
}

export function relatedJobArticles(article, limit = 3) {
  const sameTopic = JOB_ARTICLES.filter(
    (item) => item.slug !== article.slug && item.topic === article.topic,
  );
  const rest = JOB_ARTICLES.filter(
    (item) => item.slug !== article.slug && item.topic !== article.topic,
  );
  return [...sameTopic, ...rest].slice(0, limit);
}

export function normalizeArticle(row, seed) {
  return {
    id: row?.id ?? seed?.id ?? null,
    slug: row?.slug ?? seed?.slug,
    title: row?.title ?? seed?.title,
    excerpt: row?.excerpt ?? seed?.excerpt,
    body: row?.body ?? seed?.body,
    published_at: row?.published_at ?? seed?.published_at,
    kind: row?.kind ?? seed?.kind ?? "sak",
    search_query: row?.search_query ?? seed?.query ?? seed?.search_query ?? null,
    topic: row?.topic ?? seed?.topic ?? null,
    mood: row?.mood ?? seed?.mood ?? null,
  };
}

export function mergeNewsAndJobArticles(dbRows = []) {
  const map = new Map();
  for (const seed of JOB_ARTICLES) {
    map.set(seed.slug, normalizeArticle(null, seed));
  }
  for (const row of dbRows) {
    if (!row?.slug) continue;
    map.set(row.slug, normalizeArticle(row, map.get(row.slug)));
  }
  return [...map.values()].sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
}

export function filterArticles(articles, { topic, q } = {}) {
  const needle = String(q ?? "").trim().toLowerCase();
  return articles.filter((article) => {
    if (topic === "sak" && article.kind !== "sak") return false;
    if (topic && topic !== "alle" && topic !== "sak" && article.topic !== topic) return false;
    if (!needle) return true;
    const hay = [article.title, article.excerpt, article.search_query, article.body]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}
