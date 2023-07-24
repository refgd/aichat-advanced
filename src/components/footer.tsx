import { h } from 'preact'
import Browser from 'webextension-polyfill'

function Footer() {
  const extension_version = Browser.runtime.getManifest().version

  return (
    <div className="wcg-text-center wcg-text-xs wcg-text-gray-400">AIChat Advanced extension v.{extension_version}</div>
  )
}

export default Footer
