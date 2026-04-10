import InlineLink from '@/design-system/inputs/InlineLink'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { getCommonMetadata } from '@/helpers/metadata/getCommonMetadata'

export const generateMetadata = getCommonMetadata({
  title: t('Mentions légales - Nos Gestes Climat'),
  description: t('Mentions légales du site Nos Gestes Climat.'),
  alternates: {
    canonical: '/mentions-legales',
  },
})

export default function MentionsLegalesPage() {
  return (
    <div className="markdown">
      <h1>Mentions légales</h1>
      <p>
        <strong>Mis à jour le 28/05/2024</strong>
      </p>
      <h2>1. Présentation du site</h2>
      <p>
        Il est précisé aux utilisateurs du site Nos Gestes Climat l'identité des
        différents intervenants dans le cadre de sa réalisation et de son suivi.
      </p>
      <h3>1.1. Propriétaire et éditeur</h3>
      <p>
        Conformément aux dispositions de l’article 6-I 1° de la loi n°2004-575
        du 21 juin 2004 relative à la confiance dans l’économie numérique, le
        site <a href="https://nosgestesclimat.fr">https://nosgestesclimat.fr</a>{' '}
        (et autres sites en ademe.fr, ci-après les “Sites”) est édité par
        l’ADEME, ayant son siège social au :
      </p>
      <address className="fr-mb-2w">
        20, avenue du Grésillé — BP 90406
        <br />
        49004 Angers Cedex 01
        <br />
        Tél :{' '}
        <a
          target="_blank"
          rel="noreferrer noopener nofollow"
          aria-label="Numéro de téléphone - 02 41 20 41 20"
          href="tel:+33241204120">
          02 41 20 41 20
        </a>
      </address>

      <p>
        inscrit au registre du commerce d'Angers sous le n° 385 290 309,
        représentée par Sylvain Waserman, agissant en qualité de Président du
        conseil d'administration.
      </p>
      <p>
        Même si le présent est sous une URL “beta.gouv.fr”, la responsabilité,
        la propriété, et l’édition restent côté ADEME.
      </p>
      <h3>1.2. Publication</h3>
      <p>
        Le directeur de la publication est Monsieur Sylvain Waserman, en qualité
        de représentant légal de l’ADEME.
      </p>
      <p>
        La personne responsable de l'accès aux documents administratifs et des
        questions relatives à la réutilisation des informations est Monsieur Luc
        Morinière en qualité de Chef du service juridique.
      </p>
      <h3>1.3. Hébergement</h3>
      <p>
        Le prestataire assurant le stockage direct du site{' '}
        <a href="https://nosgestesclimat.fr">https://nosgestesclimat.fr</a> est
        Scalingo, dont le siège social est situé :
      </p>
      <address className="fr-mb-2w">
        13 RUE JACQUES PEIROTES, 67000 STRASBOURG
        <br />
        France
        <br />
        <a
          target="_blank"
          rel="noreferrer noopener nofollow"
          href="mailto:support@scalingo.com">
          support@scalingo.com
        </a>
      </address>

      <h3>1.4. Utilisateur</h3>
      <p>
        L’utilisateur est l’internaute qui navigue, lit, visionne, et utilise le
        site <a href="https://nosgestesclimat.fr">https://nosgestesclimat.fr</a>{' '}
        et ses services.
      </p>
      <h3>1.5. Attribution tierce</h3>
      <div id="_S_1_">
        <p>Aucun tiers n'est utilisé sur ce site.</p>
      </div>
      <h2>
        2. Acceptation des conditions d’utilisation du site et des services
        proposés
      </h2>
      <p>
        L’utilisation des Sites de l’ADEME implique l’acceptation pleine et
        entière des conditions générales d’utilisation ci-après décrites. Ces
        conditions d’utilisation sont susceptibles d’être modifiées ou
        complétées à tout moment, les utilisateurs des Sites de l’ADEME sont
        donc invités à les consulter de manière régulière.
      </p>
      <p>
        L’utilisateur reconnaît avoir pris connaissance des conditions
        d’utilisation, au moment de sa connexion sur les sites de l’ADEME, et
        déclare expressément les accepter sans réserve.
      </p>
      <h2>3. Description des services fournis</h2>
      <p>
        Les Sites de l’ADEME ont pour objet de fournir des informations
        concernant l’ensemble des éléments liés aux services de l’ADEME, en
        particulier une information sur l’actualité de la transition écologique,
        l’expertise de l’ADEME, les actions mises en œuvre au sein des
        territoires, l’action internationale de l’ADEME, les programmes de
        recherche et d’innovation.
      </p>
      <p>
        L’ADEME s’efforce de fournir sur les Sites des informations aussi
        précises que possible.
      </p>
      <p>
        Toutefois, elle ne pourra être tenue responsable des omissions, des
        inexactitudes des carences dans la mise à jour ou de tout autres
        manquements qu’ils soient de son fait ou du fait des tiers partenaires
        qui lui fournissent ces informations.
      </p>
      <p>
        Toutes les informations indiquées sur les Sites de l’ADEME sont données
        à titre indicatif, et sont susceptibles d’évoluer. Par ailleurs, les
        renseignements figurant sur les Sites de l’ADEME ne sont pas exhaustifs.
        Ils sont donnés sous réserve de modifications ayant été apportées depuis
        leur mise en ligne.
      </p>
      <h2>4. Disponibilité du site</h2>
      <p>
        L’ADEME s’efforce de permettre l’accès au site 24 heures sur 24, 7 jours
        sur 7, sauf en cas de force majeure ou d’un événement hors du contrôle
        de l’ADEME, et sous réserve des éventuelles pannes et interventions de
        maintenance nécessaires au bon fonctionnement du site et des services.
      </p>
      <p>
        Par conséquent, ni l’ADEME, ni l’incubateur de Services Numériques de la
        DINUM (animateur du programme beta.gouv.fr) ne peuvent garantir une
        disponibilité du site et/ou des services, une fiabilité des
        transmissions et des performances en termes de temps de réponse ou de
        qualité. Il n’est prévu aucune assistance technique vis-à-vis de
        l’utilisateur que ce soit par des moyens électroniques ou téléphoniques.
      </p>
      <p>
        La responsabilité de l’ADEME ne saurait être engagée en cas
        d’impossibilité d’accès à ce site et/ou d’utilisation des services.
      </p>
      <p>
        L’ADEME peut être amenée à interrompre le site ou une partie des
        services, à tout moment sans préavis, le tout sans droit à indemnités.
        L’utilisateur reconnaît et accepte que l’ADEME ne soit pas responsable
        des interruptions, et des conséquences qui peuvent en découler pour
        l’utilisateur ou tout tiers.
      </p>
      <h2>5. Liens hypertextes</h2>
      <p>
        L’ADEME et l’incubateur de Services Numériques de la DINUM déclinent
        toute responsabilité quant au contenu des sites proposés en liens.
      </p>
      <p>
        Tout site public ou privé est autorisé à établir, sans information ni
        autorisation préalable, un lien vers les informations diffusées par
        l’ATE. En revanche et sauf mentions contraires (ex. iframes), les pages
        des Sites ne doivent pas être imbriquées à l’intérieur des pages d’un
        autre site.
      </p>
      <p>
        La mise en place d’un lien est valable pour tout site à l’exception de
        ceux diffusant des informations à caractère polémique, pornographique,
        xénophobe ou pouvant, dans une plus large mesure, porter atteinte à la
        sensibilité du plus grand nombre.
      </p>
      <h2>6. Cookies de navigation</h2>
      <p>
        Des cookies sont utilisés sur les Sites pour différentes finalités :
        pour faciliter votre navigation, pour vous proposer des contenus
        personnalisés ou pour réaliser des statistiques de visites. Pour
        connaître notre politique des cookies, vous êtes invités à cliquer sur
        le lien accessible dans le pied de page des sites ademe.fr.
      </p>
      <h2>7. Propriété intellectuelle</h2>
      <p>
        Sauf mention contraire précisée sur le fichier
        <a
          target="_blank"
          rel="noreferrer noopener nofollow"
          href="https://github.com/incubateur-ademe/nosgestesclimat-app/blob/main/LICENSE">
          https://github.com/incubateur-ademe/nosgestesclimat-app/blob/main/LICENSE
        </a>
        , l’ADEME est propriétaire des droits de propriété intellectuelle ou
        détient les droits d’usage sur tous les éléments accessibles sur le
        site, notamment les textes, images, graphismes, logos, icônes, sons,
        logiciels et marques déposées.
      </p>
      <p>
        Toute reproduction, représentation, modification, publication,
        adaptation de tout ou partie des éléments du site ainsi que des logos de
        l’ADEME, quel que soit le moyen ou le procédé utilisé, est interdite,
        sauf acceptation écrite et préalable de l’ADEME d’une demande
        d’autorisation de reproduction et de représentation formulée à l’adresse
        suivante :
        <a
          target="_blank"
          rel="noreferrer noopener nofollow"
          href="https://agirpourlatransition.ademe.fr/entreprises/form/contact">
          https://agirpourlatransition.ademe.fr/entreprises/form/contact
        </a>
        .
      </p>
      <p>
        Toute exploitation non autorisée du site ou de l’un quelconque des
        éléments qu’il contient sera considérée comme constitutive d’une
        contrefaçon et poursuivie conformément aux dispositions des articles
        L.335-2 et suivants du Code de Propriété Intellectuelle.
      </p>
      <p>
        L’ADEME ne pourra en revanche interdire la réutilisation de discours,
        dossiers de presse et communiqués, les circulaires, directives et autres
        documents règlementaires.
      </p>
      <p>
        Sous réserve de dispositions spécifiques, l’ADEME autorise la
        réutilisation non commerciale et pédagogique des informations
        disponibles sur ses Sites, à la condition de respecter l’intégrité des
        informations et de n’en altérer ni le sens, ni la portée, ni
        l’application et de faire mention du nom de l’ADEME ou d’en préciser
        l’origine et la date de publication avec la mention du crédit photo si
        tel est le cas.
      </p>
      <p>
        Sous réserve de dispositions spécifiques, l’ADEME pourra autoriser la
        réutilisation d’informations à des fins commerciales ou promotionnelles
        par le biais d’une licence de réutilisation de ses informations. Est
        considérée comme réutilisation à des fins commerciales ou
        promotionnelles, l’élaboration à partir des informations publiques, d’un
        produit ou d’un service destiné à être mis à disposition de tiers, à
        titre gratuit ou onéreux.
      </p>
      <h2>8. Gestion des données personnelles</h2>
      <p>
        Conformément à la Règlementation relative à la protection des données à
        caractère personnel, l'utilisateur est informé que l’ADEME, en tant que
        responsable du traitement, met en œuvre un traitement de données à
        caractère personnel.
      </p>
      <p>
        L’ADEME est attachée au respect des règles de protection de la vie
        privée des utilisateurs de son site internet et de ses services.
        L’ensemble des traitements de données personnelles mis en œuvre dans le
        cadre des services accessibles respecte la réglementation applicable en
        matière de protection des données personnelles et notamment les
        dispositions de la loi « Informatique et libertés » du 6 janvier 1978
        modifiée et le Règlement général sur la Protection des données
        (Règlement UE 2016/679) désigné par « RGPD ».
      </p>
      <p>
        Pour en savoir plus sur ce traitement de données à caractère personnel
        et sur l’étendue de leurs droits, cliquez sur
        <a
          target="_blank"
          rel="noreferrer noopener nofollow"
          href="/politique-de-confidentialite">
          /politique-de-confidentialite
        </a>
        .
      </p>
      <h2>9. Accessibilité</h2>
      <p>
        La conformité aux normes d'accessibilité numérique est un objectif
        ultérieur mais l’ADEME tâche de rendre ce site accessible à toutes et
        tous, conformément à l'article 47 de la loi n°2005-102 du 11 février
        2005.
      </p>
      <h3>9.1. Signaler un dysfonctionnement</h3>
      <p>
        Si vous rencontrez un défaut d’accessibilité vous empêchant d’accéder à
        un contenu ou une fonctionnalité du site, merci de nous en{' '}
        <a
          target="_blank"
          rel="noreferrer noopener nofollow"
          href="mailto:contact@nosgestesclimat.fr">
          faire part
        </a>
        . Si vous n’obtenez pas de réponse rapide de notre part, vous êtes en
        droit de faire parvenir vos doléances ou une demande de saisine au
        Défenseur des droits.
      </p>
      <p>
        Pour en savoir plus sur la politique d’accessibilité numérique de
        l’État:
        <a
          target="_blank"
          rel="noreferrer noopener nofollow"
          href="http://references.modernisation.gouv.fr/accessibilite-numerique">
          http://references.modernisation.gouv.fr/accessibilite-numerique
        </a>
      </p>
      <h2>10. Sécurité</h2>
      <p>
        Le site est protégé par un certificat électronique, matérialisé pour la
        grande majorité des navigateurs par un cadenas. Cette protection
        participe à la confidentialité des échanges. En aucun cas les services
        associés à la plateforme ne seront à l’origine d’envoi d'e-mails pour
        demander la saisie d’informations personnelles.
      </p>
      <h2>11. Votre attention</h2>
      <p>
        Nous vous rappelons qu’il n’est pas possible de garantir la
        confidentialité des messages transmis sur le réseau Internet. Aussi, si
        vous souhaitez transmettre un message dans de meilleures conditions de
        sécurité, nous vous recommandons d’utiliser la voie postale. L’ADEME et
        l’incubateur de Services Numériques de la DINUM dégagent toute
        responsabilité quant aux difficultés techniques que vous pourriez
        rencontrer sur les Sites qu’elles qu’en soient la cause et l’origine.
      </p>
      <h2>12. Modifications</h2>
      <p>
        L’ADEME se réserve le droit d’adapter les présentes mentions légales.
      </p>
      <p>
        Si l’ADEME apporte une modification aux présentes mentions légales, elle
        publiera la nouvelle version sur les supports concernés et actualisera
        la date de « dernière mise à jour » figurant en haut des présentes
        mentions légales.
      </p>
      <p>
        L’ADEME vous invite donc à consulter régulièrement les supports
        concernés où sont publiées les mentions légales.
      </p>

      <h2>13. Conditions d’utilisation des données Base Empreinte</h2>
      <p>
        L’application Nos Gestes Climat offre un accès aux jeux données qui sont
        des résultats d'évaluation du cycle de vie multicritères ou monocritères
        GES provenant notamment de la Base Empreinte® et d’autres fournisseurs
        de données. Ces jeux de données sont utilisés pour la réalisation des
        calculs d’empreinte environnementale
        <ul>
          <li>
            Les jeux de données Base Carbone®, qui sont des résultats
            d'évaluation du cycle de vie monocritère GES (ou facteurs
            d’émissions GES), pour la réalisation de bilans gaz à effet de serre
            (réglementaires et volontaires) pour les organisations (entreprises,
            collectivités...) ;
          </li>
          <li>
            Les jeux de données Base IMPACTS®, qui sont des résultats
            d'évaluation du cycle de vie multicritères, pour l’affichage
            environnemental français (AE) ainsi qu’à l’éco-conception ;
          </li>
          <li>
            Les jeux données Base Empreinte® qui sont des résultats d'évaluation
            du cycle de vie multicritères provenant majoritairement de la base
            de données ecoinvent et d’autres fournisseurs de données.
          </li>
        </ul>
      </p>
      <p>
        Ces jeux de données sont utilisés pour la réalisation de bilans gaz à
        effet de serre des organisations, la règlementation information GES des
        prestations de transport, l’affichage environnemental français,
        l’écoconception et l’évaluation de projets.
      </p>
      <p>
        L’ADEME est le propriétaire des droits de propriété intellectuelle
        portant tant sur la structure que sur le contenu du site mais Base
        Empreinte est concessionnaire des jeux de données ecoinvent, qui sont de
        la propriété d’ecoinvent. L’utilisation de ces données est soumise aux
        conditions d’utilisation présentées dans{' '}
        <InlineLink href="/mentions-legales-base-empreinte">
          les mentions légales dédiées
        </InlineLink>
        .
      </p>
    </div>
  )
}
