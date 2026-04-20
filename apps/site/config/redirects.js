const redirects = [
  {
    source: '/actions/liste',
    destination: '/actions',
    permanent: true,
  },
  {
    source: '/actions',
    destination: '/mon-espace/actions',
    permanent: true,
  },
  {
    source: '/documentation/guide',
    destination: '/documentation',
    permanent: true,
  },
  {
    source: '/documentation/modele',
    destination: '/modele',
    permanent: true,
  },
  // Compte U
  {
    source: '/profil/:path*',
    destination: '/mon-espace',
    permanent: true,
  },
  // Mode Groupe / amis / classement
  {
    source: '/groupes/:path*',
    destination: '/amis/:path*',
    permanent: true,
  },
  {
    source: '/amis',
    destination: '/classements',
    permanent: true,
  },
  {
    source: '/classements',
    destination: '/mon-espace/groupes',
    permanent: true,
  },
  {
    source: '/conférence/:path*',
    destination: 'https://sondages.nosgestesclimat.fr/conférence/:path*',
    permanent: true,
  },
  {
    source: '/sondage/:path*',
    destination: 'https://sondages.nosgestesclimat.fr/sondage/:path*',
    permanent: true,
  },
  {
    source: '/mon-empreinte-carbone/:path*',
    destination: '/fin/:path*',
    permanent: true,
  },
  {
    source: '/nouveaut%C3%A9s/Guadeloupe',
    destination: '/nouveautes/guadeloupe',
    permanent: true,
  },
  {
    source: '/nouveaut%C3%A9s/Vatnaj%C3%B6kull',
    destination: '/nouveautes/vatnajokull',
    permanent: true,
  },
  {
    source: '/nouveaut%C3%A9s/:path*',
    destination: '/nouveautes/:path*',
    permanent: true,
  },
  {
    source: '/vie-priv%C3%A9e',
    destination: '/politique-de-confidentialite',
    permanent: true,
  },
  {
    source: '/vie-privee',
    destination: '/politique-de-confidentialite',
    permanent: true,
  },
  {
    source: '/politique-des-cookies',
    destination: '/politique-de-confidentialite',
    permanent: true,
  },
  {
    source: '/partenaires',
    destination: '/diffuser',
    permanent: true,
  },
  {
    source: '/blog/journée-mondial-environnement',
    destination: '/blog/journee-mondial-environnement',
    permanent: true,
  },
  {
    source: '/mod%C3%A8le',
    destination: '/modele',
    permanent: true,
  },
  {
    source: '/%C3%A0-propos',
    destination: '/a-propos',
    permanent: true,
  },
  {
    source: '/a-propos',
    destination: 'https://beta.gouv.fr/startups/nosgestesclimat.html',
    permanent: true,
  },
  {
    source: '/groupe/:path*',
    destination: 'https://sondages.nosgestesclimat.fr/',
    permanent: true,
  },

  {
    source: '/guide/services-soci%C3%A9taux',
    destination: '/guide/services-societaux',
    permanent: true,
  },
  {
    source: '/guide/num%C3%A9rique',
    destination: '/guide/numerique',
    permanent: true,
  },
  {
    source: '/o/:organisation/:poll',
    destination: '/simulateur/campagne/:poll',
    permanent: true,
  },
  {
    source: '/organisations/:orgaSlug/resultats-detailles',
    destination:
      '/organisations/:orgaSlug/campagnes/campagne-1?isRedirectFromLegacy=true',
    permanent: true,
  },
  {
    source: '/ambassadeurs',
    destination: '/nos-relais',
    permanent: true,
  },
  // Blog v1 > Blog v2
  {
    source: '/blog/empreinte-eau-pourquoi-comment',
    destination:
      '/blog/actualites-et-fonctionnalites/empreinte-eau-pourquoi-comment',
    permanent: true,
  },
  {
    source: '/blog/fonctionnalite-animateurs-ateliers-sensibilisation',
    destination:
      '/blog/actualites-et-fonctionnalites/fonctionnalite-animateurs-ateliers-sensibilisation',
    permanent: true,
  },
  {
    source: '/blog/nouveau-parcours-organisations',
    destination:
      '/blog/actualites-et-fonctionnalites/nouveau-parcours-organisations',
    permanent: true,
  },
  {
    source: '/blog/challenge-tes-amis',
    destination: '/classements',
    permanent: true,
  },
  {
    source: '/blog/actualites-et-fonctionnalites/challenge-tes-amis',
    destination: '/classements',
    permanent: true,
  },
  {
    source: '/blog/journee-mondial-environnement',
    destination:
      '/blog/actualites-et-fonctionnalites/journee-mondial-environnement',
    permanent: true,
  },
  {
    source: '/blog/campus',
    destination: '/classements',
    permanent: true,
  },
  {
    source: '/blog/actualites-et-fonctionnalites/campus',
    destination: '/classements',
    permanent: true,
  },
  {
    source: '/blog/historique',
    destination: '/blog/actualites-et-fonctionnalites/historique',
    permanent: true,
  },
  {
    source: '/blog/transports-fuir-transports-cherir',
    destination: '/blog/mobilites/transports-fuir-transports-cherir',
    permanent: true,
  },
  {
    source: '/blog/alternatives-voiture-individuelle',
    destination: '/blog/mobilites/alternatives-voiture-individuelle',
    permanent: true,
  },
  {
    source: '/blog/affichage-ges-transport',
    destination: '/blog/mobilites/affichage-ges-transport',
    permanent: true,
  },
  {
    source: '/blog/impact-mobilite',
    destination: '/classements',
    permanent: true,
  },
  {
    source: '/blog/mobilites/impact-mobilite',
    destination: '/blog/mobilites/mobilites-douces-modes-transport-puissants',
    permanent: true,
  },
  {
    source: '/blog/lexique-eau-tout-comprendre',
    destination: '/blog/environnement/lexique-eau-tout-comprendre',
    permanent: true,
  },
  {
    source: '/blog/effet-rebond',
    destination: '/blog/environnement/effet-rebond',
    permanent: true,
  },
  {
    source: '/blog/carbone-empreinte-parmi-autres',
    destination: '/blog/environnement/carbone-empreinte-parmi-autres',
    permanent: true,
  },
  {
    source: '/blog/maladaptation',
    destination: '/blog/environnement/maladaptation',
    permanent: true,
  },
  {
    source: '/blog/budget',
    destination: '/blog/environnement/budget',
    permanent: true,
  },
  {
    source: '/empreinte-climat',
    destination: '/blog/environnement/definition-empreinte-carbone',
    permanent: true,
  },
  {
    source: '/blog/reflexes-textile-econome-empreinte-eau',
    destination: '/blog/consommation/reflexes-textile-econome-empreinte-eau',
    permanent: true,
  },
  {
    source: '/blog/demenagement-decarbonation',
    destination: '/blog/logement/demenagement-decarbonation',
    permanent: true,
  },
  {
    source: '/blog/8-facons-ameliorer-empreinte-de-mon-assiette',
    destination:
      '/blog/alimentation/8-facons-ameliorer-empreinte-de-mon-assiette',
    permanent: true,
  },
  {
    source: '/blog/environment/definition-empreinte-carbone',
    destination: '/blog/environnement/definition-empreinte-carbone',
    permanent: true,
  },
  {
    source: '/blog/undefined/neuf-limites-planetaires-empreintes',
    destination: '/blog/environnement/neuf-limites-planetaires-empreintes',
    permanent: true,
  },
  // For now, we redirect actions/plus homepage to blog homepage. We still have each actions/plus page available but ghosted.
  {
    source: '/actions/plus',
    destination: '/blog',
    permanent: true,
  },
  {
    source: '/contextes-de-sondages',
    destination: '/',
    permanent: true,
  },
  // Iframe scripts
  {
    source: '/iframe.js',
    destination: '/scripts/iframe.js',
    permanent: true,
  },
  {
    source: '/iframeSimulation.js',
    destination: '/scripts/iframeSimulation.js',
    permanent: true,
  },
  // Demos
  {
    source: '/demo-iframe-datashare.html',
    destination: '/demos/demo-iframe-datashare.html',
    permanent: true,
  },
  {
    source: '/demo-iframe.html',
    destination: '/demos/demo-iframe.html',
    permanent: true,
  },
  {
    source: '/demo-iframeSimulation.html',
    destination: '/demos/demo-iframeSimulation.html',
    permanent: true,
  },
  {
    source: '/demo-iframeSimulationHomepage.html',
    destination: '/demos/demo-iframeSimulationHomepage.html',
    permanent: true,
  },
  // Misc
  {
    source: '/4dc3300c431ca82c00785768559ea871.html',
    destination: '/misc/4dc3300c431ca82c00785768559ea871.html',
    permanent: true,
  },
  {
    source: '/NGC_Kit.diffusion.zip',
    destination: '/misc/NGC_Kit.diffusion.zip',
    permanent: true,
  },
  // Landings thématiques
  {
    source: '/themes',
    destination: '/',
    permanent: true,
  },
  {
    source: '/empreinte-carbone-alimentation',
    destination: '/themes/empreinte-carbone-alimentation',
    permanent: true,
  },
  {
    source: '/empreinte-carbone-transport',
    destination: '/themes/empreinte-carbone-transport',
    permanent: true,
  },
  {
    source: '/empreinte-carbone-logement',
    destination: '/themes/empreinte-carbone-logement',
    permanent: true,
  },
  {
    source: '/en/themes/empreinte-carbone-alimentation',
    destination: '/en',
    permanent: true,
  },
  {
    source: '/en/themes/empreinte-carbone-logement',
    destination: '/en',
    permanent: true,
  },
  {
    source: '/en/themes/empreinte-carbone-transport',
    destination: '/en',
    permanent: true,
  },
  {
    source: '/en/themes/:restOfPath',
    destination: '/themes/:restOfPath',
    permanent: true,
  },
  // Guides fr
  {
    source: '/guide',
    destination: '/',
    permanent: true,
  },
  {
    source: '/guide/alimentation',
    destination: '/themes/empreinte-carbone-alimentation',
    permanent: true,
  },
  {
    source: '/guide/transport',
    destination: '/themes/empreinte-carbone-transport',
    permanent: true,
  },
  {
    source: '/guide/logement',
    destination: '/themes/empreinte-carbone-logement',
    permanent: true,
  },
  {
    source: '/guide/numerique',
    destination: '/',
    permanent: true,
  },
  {
    source: '/guide/divers',
    destination: '/',
    permanent: true,
  },
  {
    source: '/guide/services-societaux',
    destination: '/',
    permanent: true,
  },
  // Guides en
  {
    source: '/en/guide',
    destination: '/en',
    permanent: true,
  },
  {
    source: '/en/guide/alimentation',
    destination: '/en',
    permanent: true,
  },
  {
    source: '/en/guide/transport',
    destination: '/en',
    permanent: true,
  },
  {
    source: '/en/guide/logement',
    destination: '/en',
    permanent: true,
  },
  {
    source: '/en/guide/divers',
    destination: '/en',
    permanent: true,
  },
  {
    source: '/en/guide/numerique',
    destination: '/en',
    permanent: true,
  },
  {
    source: '/en/guide/services-societaux',
    destination: '/en',
    permanent: true,
  },
  // Do not remove this redirection - ES locale existed before
  {
    source: '/es/:path*',
    destination: '/en/:path*',
    permanent: true,
  },
  // Short URL for Brevo
  {
    source: '/infolettres',
    destination:
      'https://856c23af.sibforms.com/serve/MUIFANYp6c5xdsAuy6IDcikFeb1acMwlG343iU22fjxPSfx0ZCaGTU6WN7PnnSe21HYaHOpyKT0SlpSy9uUFEBV9xSf_N_D-bs37tVyLgGHVm0kCV9yCNDgO3FFvXuUpk7aVWboulQpZ7DcQhk8RuIfiiWOt2JgZOzEfd4JlqynZRDNGcQ9JMpSvziB7Q3J8DHWtLINw7TgNmuGj',
    permanent: true,
  },
  {
    source: '/en/empreinte',
    destination: '/en',
    permanent: true,
  },
  {
    source: '/accessibilit%C3%A9',
    destination: '/accessibilite',
    permanent: true,
  },
  {
    source: '/demo-iframesimulation',
    destination: '/',
    permanent: true,
  },
  {
    source: '/northstar',
    destination: '/',
    permanent: true,
  },
  {
    source: '/blog/environnement/journee-mondial-environnement',
    destination: '/',
    permanent: true,
  },
  {
    source: '/contribuer',
    destination: '/',
    permanent: true,
  },
  {
    source: '/p%C3%A9trole-et-gaz',
    destination: '/',
    permanent: true,
  },
  {
    source: '/empreinte',
    destination: '/',
    permanent: true,
  },
  {
    source: '/partenaire',
    destination: '/',
    permanent: true,
  },

  {
    source: '/partage',
    destination: '/',
    permanent: true,
  },
]

export default redirects
