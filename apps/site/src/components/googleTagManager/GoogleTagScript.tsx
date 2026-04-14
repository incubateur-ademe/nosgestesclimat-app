import Script from 'next/script'

export function GoogleTagScript() {
  return (
    <Script
      id="google-ads-script"
      strategy="afterInteractive"
      type="text/javascript">
      {`
        // Initialize dataLayer and gtag function
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}

        // Set default consent state to denied for all consent types
        gtag('consent', 'default', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied',
          'analytics_storage': 'denied',
          'functionality_storage': 'denied',
          'personalization_storage': 'denied',
          'security_storage': 'granted'
        });

        // Load GTM
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}');
      `}
    </Script>
  )
}
