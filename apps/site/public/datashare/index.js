window.addEventListener('message', function (e) {
  const data = e.data

  // Check if it's our target message
  if (
    data &&
    typeof data === 'object' &&
    data !== null &&
    data.messageType === 'ngc-iframe-share'
  ) {
    console.log('MON RESULTAT DE SIMULATION', data.data || data.error)
  }
})
