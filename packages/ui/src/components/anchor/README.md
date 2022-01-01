---
group: Navigation
title: Anchor
---

Jump to the specified location on the page.

## When To Use

Need to show the anchor links available for jumping on the current page, and quickly jump between anchor points.

## API

### DAnchorProps

Extend `React.HTMLAttributes<HTMLUListElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dDistance | Distance from page to anchor | number | 0 |
| dPage | Set scrolling page, default is `window` view | [DElementSelector](/components/Interface#DElementSelector) | - |
| dScrollBehavior | Custom scrolling behavior | 'instant' \| 'smooth' | 'instant' |
| dIndicator | Custom indicator, pre-defined indicators of `DOT_INDICATOR` and `LINE_INDICATOR` patterns | React.ReactNode \| symbol | DOT_INDICATOR |
| onHrefChange | Anchor point change callback | `(href: string \| null) => void` | - |
<!-- prettier-ignore-end -->

### DAnchorLinkProps

Extend `React.LiHTMLAttributes<HTMLLIElement>`.

<!-- prettier-ignore-start -->
| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| dLevel | Set the anchor level | number | 0 |
| href | Set anchor link | string | - |
<!-- prettier-ignore-end -->
