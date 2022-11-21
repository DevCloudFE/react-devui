# Change Log

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.0.0-alpha.1](https://github.com/DevCloudFE/react-devui/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2022-11-21)

### Performance Improvements

- `createGlobalState` export `set` method without state ([f695966](https://github.com/DevCloudFE/react-devui/commit/f6959667a39afb703cad7c0a7fe60e748e2139cf))
- **platform:** use `React.memo` render routes ([75a332d](https://github.com/DevCloudFE/react-devui/commit/75a332d59e3c4e16dd299d3814faebe4df07cea3))

# [1.0.0-alpha.0](https://github.com/DevCloudFE/react-devui/compare/v0.1.0-alpha.11...v1.0.0-alpha.0) (2022-11-18)

### Bug Fixes

- **platform:** save query when refresh table ([94ad9d8](https://github.com/DevCloudFE/react-devui/commit/94ad9d85a2c170f5293fce9ed243b7f600c0c756))
- **ui:** `dSkipFirstTransition` should be `false` to keep mask transition ([22c1f9e](https://github.com/DevCloudFE/react-devui/commit/22c1f9eb82ac90f56ccc2c3609f13bb9d90b5d6a))
- **ui:** add stopPropagation to upload-action ([67172c7](https://github.com/DevCloudFE/react-devui/commit/67172c7fc20bd9409a5ae1fb2f5d6f594989e493))
- **ui:** clearable when date not null ([3d4333a](https://github.com/DevCloudFE/react-devui/commit/3d4333af57c80098ef2a90240b61cba8a87ae52b))
- **ui:** default value of `dNowrap` should be false ([f809548](https://github.com/DevCloudFE/react-devui/commit/f80954853a0fee5593cc3501f8b255e19748c09e))
- **ui:** fix miss tree panel's `ref` ([2503338](https://github.com/DevCloudFE/react-devui/commit/2503338a70f112310f81e253a9b3bc7ceeee1911))
- **ui:** fix update upload list ([763e429](https://github.com/DevCloudFE/react-devui/commit/763e4290e24c7f581df39073592e4a2bc8b36900))
- **ui:** spinner should display inline when `dAlone` is true ([c5ec01d](https://github.com/DevCloudFE/react-devui/commit/c5ec01d2c9f56cfc3573a1eb60a97ecd97d254a4))

### Code Refactoring

- **ui:** refactor `slides` component ([c71e227](https://github.com/DevCloudFE/react-devui/commit/c71e227e1b2974f762f9b9b38dbc402e9dea1337))

### Features

- **platform:** add detail route ([a06e2a3](https://github.com/DevCloudFE/react-devui/commit/a06e2a39f7e6bf5fadd5292ef7d73bd763bb2744))
- **ui:** `slides` support swipe gesture ([2f2ce7d](https://github.com/DevCloudFE/react-devui/commit/2f2ce7d289b53943492dfff3ca75efe8ac738974))
- **ui:** support destroy node after element hided ([060c0cd](https://github.com/DevCloudFE/react-devui/commit/060c0cdc3695591d7873453c26ab2b1e66d81d6c))

### BREAKING CHANGES

- **ui:** remove `swiper`

# [0.1.0-alpha.11](https://github.com/DevCloudFE/react-devui/compare/v0.1.0-alpha.10...v0.1.0-alpha.11) (2022-11-08)

### Bug Fixes

- `sourceMap` should be `false` ([d4566d3](https://github.com/DevCloudFE/react-devui/commit/d4566d39e35bd58f895c6c3aad146d22e07e7ed5))

# [0.1.0-alpha.10](https://github.com/DevCloudFE/react-devui/compare/v0.1.0-alpha.9...v0.1.0-alpha.10) (2022-11-08)

### Bug Fixes

- **ui:** dropdown of multi-select not focusable ([2c0d85b](https://github.com/DevCloudFE/react-devui/commit/2c0d85b73c5df318b64166dab9d7c057fd3a3466))
- **ui:** fix calculation of `aria-setsize` ([864290d](https://github.com/DevCloudFE/react-devui/commit/864290d3b11c46c6a08ec487de07167f2ef7ec53))
- **ui:** fix focus when press `ArrowRight` ([7e5d31c](https://github.com/DevCloudFE/react-devui/commit/7e5d31c9ecad34ce0d6ed965f308bc25264dc210))
- **ui:** fix init cascader focus ([c7c155d](https://github.com/DevCloudFE/react-devui/commit/c7c155d7952a2d36d46340df7078fcf83da27e64))
- **ui:** fix miss right arg in range slider ([8bb5d0f](https://github.com/DevCloudFE/react-devui/commit/8bb5d0f737ab89346a20ac58642c5be26c853732))
- **ui:** fix textarea `minHeight` ([5ab8359](https://github.com/DevCloudFE/react-devui/commit/5ab83592a7e1017c3e6b619b92938ca0a839dddc))

### Features

- add `inWindow` arg for calculate position ([f3e554c](https://github.com/DevCloudFE/react-devui/commit/f3e554cf417e3dd74b25c3f9ae86c82d11735d57))
- add data generater for base64 ([1888f80](https://github.com/DevCloudFE/react-devui/commit/1888f8057a0d2e8ba82a38310ebd465d3c35acf3))
- add platform template ([308bdf0](https://github.com/DevCloudFE/react-devui/commit/308bdf04f40c86e212460b70111f5648a1140398))
- add vscode extension ([34501ec](https://github.com/DevCloudFE/react-devui/commit/34501ecaf019e90b3829a4afbfd5fcc6016020f6))
- **platform:** add `Marker`. `MarkerCluster` and `InfoWindow` ([92ad49d](https://github.com/DevCloudFE/react-devui/commit/92ad49d2323c9a5ce855d8187b14e8f2882fd02c))
- **platform:** add `test` route ([ad7260c](https://github.com/DevCloudFE/react-devui/commit/ad7260cf228bef09f42247a78c2ae62658b5f579))
- **platform:** add amap route ([18f1e12](https://github.com/DevCloudFE/react-devui/commit/18f1e12cc9f1b9935493ee22cd3821637c0f8b3a))
- **platform:** add echarts route ([8639847](https://github.com/DevCloudFE/react-devui/commit/86398470c3a86c49c0e7bd2e85b5f33eab891ab8))
- **platform:** add login route ([8a418f1](https://github.com/DevCloudFE/react-devui/commit/8a418f13f1549e4b9cd58f3d4b5cd342ca4a6f87))
- **platform:** add table route ([67ddeb0](https://github.com/DevCloudFE/react-devui/commit/67ddeb03fdf2b11d20e5cab6b0fc92e0ca40b593))
- **platform:** use latest options of echarts ([ef57069](https://github.com/DevCloudFE/react-devui/commit/ef570692015887d7b7e8ffe9cdd90cf515b6867f))
- **site:** add `Compose` and `VirtualScroll` tag ([1407515](https://github.com/DevCloudFE/react-devui/commit/140751541939a5c4926ce17dcae1e76c2ecf6196)), closes [#183](https://github.com/DevCloudFE/react-devui/issues/183)
- **ui:** fab add backtop support ([4c36143](https://github.com/DevCloudFE/react-devui/commit/4c36143c5106a62d1e39f90890732409a22926a6))
- **ui:** optimize auto position ([a94d4c0](https://github.com/DevCloudFE/react-devui/commit/a94d4c0fd431e95a70012b4e5bdb11c1befbd659))

# [0.1.0-alpha.9](https://github.com/DevCloudFE/react-devui/compare/v0.1.0-alpha.8...v0.1.0-alpha.9) (2022-08-18)

### Bug Fixes

- **ui:** fix first popup update ([0d0262d](https://github.com/DevCloudFE/react-devui/commit/0d0262defd21bf5bfb53d286dbf2d319b5508179))

# [0.1.0-alpha.8](https://github.com/DevCloudFE/react-devui/compare/v0.1.0-alpha.7...v0.1.0-alpha.8) (2022-08-17)

**Note:** Version bump only for package react-devui

# [0.1.0-alpha.7](https://github.com/DevCloudFE/react-devui/compare/v0.1.0-alpha.6...v0.1.0-alpha.7) (2022-08-17)

### Bug Fixes

- **ui:anchor:** use `getElementById` ([7bd740b](https://github.com/DevCloudFE/react-devui/commit/7bd740b18e9bfb494f6b2a5b32a9e696cd2d75ca))

# [0.1.0-alpha.6](https://github.com/DevCloudFE/react-devui/compare/v0.1.0-alpha.5...v0.1.0-alpha.6) (2022-08-16)

**Note:** Version bump only for package react-devui

# [0.1.0-alpha.5](https://github.com/DevCloudFE/react-devui/compare/v0.1.0-alpha.4...v0.1.0-alpha.5) (2022-08-16)

### Bug Fixes

- **ui:** add `rfs` to dependencies ([0da6e7f](https://github.com/DevCloudFE/react-devui/commit/0da6e7fb3c0c2fafff5c8ac97c005e702f16fc1d))

# [0.1.0-alpha.4](https://github.com/DevCloudFE/react-devui/compare/v0.1.0-alpha.3...v0.1.0-alpha.4) (2022-08-16)

**Note:** Version bump only for package react-devui

# [0.1.0-alpha.3](https://github.com/DevCloudFE/react-devui/compare/v0.1.0-alpha.2...v0.1.0-alpha.3) (2022-08-16)

**Note:** Version bump only for package react-devui

# [0.1.0-alpha.2](https://github.com/DevCloudFE/react-devui/compare/v0.1.0-alpha.1...v0.1.0-alpha.2) (2022-08-15)

### Bug Fixes

- **ui:** add `rfs` that miss ([183252e](https://github.com/DevCloudFE/react-devui/commit/183252ea5a88e78a7afc552f9e445f456a61dc2b))

# [0.1.0-alpha.1](https://github.com/DevCloudFE/react-devui/compare/v0.1.0-alpha.0...v0.1.0-alpha.1) (2022-08-15)

**Note:** Version bump only for package react-devui

# 0.1.0-alpha.0 (2022-08-15)

### Bug Fixes

- **ui:form:** fix required type of 'optional' ([ca475f7](https://github.com/DevCloudFE/react-devui/commit/ca475f7ddc5b6830bc0fc4faeece2bbeb1805570))
- **ui:form:** rename form.ts to form-control.ts to fix case-sensitive errors ([4af2536](https://github.com/DevCloudFE/react-devui/commit/4af253671629e435b48c7b325c7889501ea078d1))
- **ui:input:** fix number decrease ([f3cfaac](https://github.com/DevCloudFE/react-devui/commit/f3cfaac7b1ab26bcd73a0cf50a38a6c0bc4f58e4))
- **ui:menu:** fix menu `dExpandOne` not work ([c265bbb](https://github.com/DevCloudFE/react-devui/commit/c265bbb8f22d8368dee72ba2cb665e2a991896b3))
- **ui:menu:** fix popup in vertical mode ([686ef7e](https://github.com/DevCloudFE/react-devui/commit/686ef7e2b132e4c9140602e87d02f2d00ece499f))
- **ui:menu:** remove the use of the debug interface ([0a4d0e8](https://github.com/DevCloudFE/react-devui/commit/0a4d0e8f8512809f57596ae604eb84b713f162e3))
- **ui:modal:** use `%` instead of `vh` to avoid overview in mobile ([1cafbbc](https://github.com/DevCloudFE/react-devui/commit/1cafbbc30446dab4fb77f3208db61cc957fb352c))
- **ui:select-box:** fix `disabled` missing ([2e1aef6](https://github.com/DevCloudFE/react-devui/commit/2e1aef69267f9fb69db526512ddc8efd77abd614))
- **ui:selectbox:** fix `dSearchable` not work ([46ff2fe](https://github.com/DevCloudFE/react-devui/commit/46ff2fe94f2f941d741a727384551ee68f2ee456))
- **ui:time-picker:** fix time order ([912d557](https://github.com/DevCloudFE/react-devui/commit/912d55794926cf16b4151bf11a877af84bdc9baf))
- **ui:** disable event when loading ([21e6d07](https://github.com/DevCloudFE/react-devui/commit/21e6d077c612e2e11307a8fbf4ded39288b6e623))
- **ui:** fix `onChange` not work ([16b1fdb](https://github.com/DevCloudFE/react-devui/commit/16b1fdba8429d2660a3957a616d5a86d13add5ae))
- **ui:** fix `useMaxIndex` ([8803c50](https://github.com/DevCloudFE/react-devui/commit/8803c50941a94d977d41618f1c8ba70114d6f310))
- **ui:** fix bug of `useTwoWayBinding` ([6767097](https://github.com/DevCloudFE/react-devui/commit/67670977f6f760be506d7de7913285f305535793))
- **ui:** fix some bugs of SSR support ([1929327](https://github.com/DevCloudFE/react-devui/commit/19293279a4db45934b5f78c9a5cfa2c0d1dc4705))
- **ui:** use `dPrefix` instead of `d-` ([76ba32e](https://github.com/DevCloudFE/react-devui/commit/76ba32eef5cc1b6ce92f9a66ee4774f77e9efda3))

### Features

- add dark theme ([ee1d708](https://github.com/DevCloudFE/react-devui/commit/ee1d708c043559e776156c41a31cc386e35c2fd4))
- add lerna ([1faa7a5](https://github.com/DevCloudFE/react-devui/commit/1faa7a5be29c0d5f6c61e8a3e9a02f69a5aec6b1))
- **site:** support custom markdown route ([d2511ee](https://github.com/DevCloudFE/react-devui/commit/d2511eeec1d4b249d07cdf56f24a773d66be3f72))
- **site:** support mobile ([0d62159](https://github.com/DevCloudFE/react-devui/commit/0d62159c39f26bf7ca573eae8db03d35ed28318b))
- **ui:dropdown:** add dropdown-group ([b193cf0](https://github.com/DevCloudFE/react-devui/commit/b193cf0d71fdf68228aa6975d70df7f711251961))
- **ui:input:** add number type input ([c9889b4](https://github.com/DevCloudFE/react-devui/commit/c9889b4a58fec81232620bddb19007b2e8be644f))
- **ui:time-picker:** improve logic of 'Enter' keydown ([ddaa337](https://github.com/DevCloudFE/react-devui/commit/ddaa3375aa7e118f1bd431a65406e6846c77770c))
- **ui:** add `accordion` component ([768b97c](https://github.com/DevCloudFE/react-devui/commit/768b97c4481ee37f6dd5ee17e7255415316f33b3))
- **ui:** add `alert` component ([a7fbe3d](https://github.com/DevCloudFE/react-devui/commit/a7fbe3d18e685b61ad0642f59906aca86c2357be))
- **ui:** add `auto-complete` component ([bff2457](https://github.com/DevCloudFE/react-devui/commit/bff245752ff168e74336db04521dc9b6cb52116d))
- **ui:** add `avatar` component ([da42400](https://github.com/DevCloudFE/react-devui/commit/da42400d512aa6bcb07b7ff33fb5d40a5be53e6b))
- **ui:** add `back-top` component ([8c71508](https://github.com/DevCloudFE/react-devui/commit/8c71508e0927b4764f3d210ea0d6dfc425b8c817))
- **ui:** add `badge` component ([53f934d](https://github.com/DevCloudFE/react-devui/commit/53f934d2b4ce42d1f014c03318f9f4d7953f2a0b))
- **ui:** add `breadcrumb` component ([ae97c22](https://github.com/DevCloudFE/react-devui/commit/ae97c22f4174c315c08d38c4232b65aa3a1d6de2))
- **ui:** add `card` component ([765c628](https://github.com/DevCloudFE/react-devui/commit/765c6287e8992ec544d60cd0328bcac1a76f42f0))
- **ui:** add `cascader` component ([6cad956](https://github.com/DevCloudFE/react-devui/commit/6cad95652e4897184f74d9b5e72e9b66cac6d4da))
- **ui:** add `checkbox` component ([71f787f](https://github.com/DevCloudFE/react-devui/commit/71f787f19edcccf94c4d511ad8d5d00c4e98e71d))
- **ui:** add `compose` component ([9189038](https://github.com/DevCloudFE/react-devui/commit/9189038d6e4856fad68443b373609c65d9022f04))
- **ui:** add `date-picker` component ([83a33a7](https://github.com/DevCloudFE/react-devui/commit/83a33a7b140a4d0e2364a0067fe160721f5baf65))
- **ui:** add `dEscClose` prop ([9143505](https://github.com/DevCloudFE/react-devui/commit/91435058b4dc5d0dcf920f3f41124e1554fc6ac2))
- **ui:** add `dropdown` component ([9613142](https://github.com/DevCloudFE/react-devui/commit/9613142b1f71f756b2ec779bbe546d742e8051a9))
- **ui:** add `empty` component ([3305f22](https://github.com/DevCloudFE/react-devui/commit/3305f22471fa880ed33b4c7d95cb14f387dcb395))
- **ui:** add `form` component ([2f53edc](https://github.com/DevCloudFE/react-devui/commit/2f53edca72e4ab3c117f08daca03f04178d50996))
- **ui:** add `grid` component ([fa1f5bc](https://github.com/DevCloudFE/react-devui/commit/fa1f5bcfed9983a350ca6eae40d10847621500d5))
- **ui:** add `image` component ([4e03e12](https://github.com/DevCloudFE/react-devui/commit/4e03e1267f69623e7a9d94aa7af8734b81298a7d))
- **ui:** add `input` component ([51c3d86](https://github.com/DevCloudFE/react-devui/commit/51c3d8654f38e7a07803a10f2d4bb2a8dbb5f3fe))
- **ui:** add `loading` component ([2f55334](https://github.com/DevCloudFE/react-devui/commit/2f55334e4aef248bd4d135a9bb796456c5ee890d))
- **ui:** add `modal` component ([28cdad5](https://github.com/DevCloudFE/react-devui/commit/28cdad5ac514dec3b266b847db4df021d95f48f9)), closes [#41](https://github.com/DevCloudFE/react-devui/issues/41)
- **ui:** add `notification` component ([9abbaa6](https://github.com/DevCloudFE/react-devui/commit/9abbaa6cd4ab36f5b815f7f9253efdfd42f5dd18))
- **ui:** add `pagination` component ([3741be4](https://github.com/DevCloudFE/react-devui/commit/3741be4843ead7d953551063ecdcaf356949589a))
- **ui:** add `popover` component ([40c07ca](https://github.com/DevCloudFE/react-devui/commit/40c07ca801ec00c07ebae245002771a17685bf97))
- **ui:** add `progress` component ([069a05f](https://github.com/DevCloudFE/react-devui/commit/069a05f5c11c578817f6ba9219ca976741e402ea))
- **ui:** add `radio` component ([fc0aa88](https://github.com/DevCloudFE/react-devui/commit/fc0aa880279e0fb2cf5b2c218c01ca1767d6c030))
- **ui:** add `rating` component ([07daffe](https://github.com/DevCloudFE/react-devui/commit/07daffec0de6140dcc52968fa09ff72f2d320fa6))
- **ui:** add `select` component ([6890d92](https://github.com/DevCloudFE/react-devui/commit/6890d92ec757356bd570b37245fd20aa567f4765))
- **ui:** add `separator` component ([b20bd7c](https://github.com/DevCloudFE/react-devui/commit/b20bd7c7b9148dd7cfcd9ecb8d15658eb5cec358))
- **ui:** add `skeleton` component ([1dbb55b](https://github.com/DevCloudFE/react-devui/commit/1dbb55b911c910af4d9468207b624d9bea793d89))
- **ui:** add `slider` component ([44c77fb](https://github.com/DevCloudFE/react-devui/commit/44c77fb7742d240b9adef0121ca91d781d0369a4))
- **ui:** add `slides` component ([b48f47d](https://github.com/DevCloudFE/react-devui/commit/b48f47d912cb9d7eb56b8748a2514216aa93bbdd))
- **ui:** add `stepper` component ([bf65139](https://github.com/DevCloudFE/react-devui/commit/bf6513919effbd7a4170c7308ccea58f13c05762))
- **ui:** add `switch` component ([a214b9a](https://github.com/DevCloudFE/react-devui/commit/a214b9a7fe69377c6f07067cd76faa3dce85fdf3))
- **ui:** add `table` component ([567057f](https://github.com/DevCloudFE/react-devui/commit/567057f1587199e2c8fb5486a4f433bc878929f5))
- **ui:** add `tabs` component ([106229c](https://github.com/DevCloudFE/react-devui/commit/106229c5cbe51b361edc8e4c823803ca2f7b90b1))
- **ui:** add `textarea` component ([144776b](https://github.com/DevCloudFE/react-devui/commit/144776b0c82ba12fcf90ab22c67af8f20df07d72))
- **ui:** add `time-picker` component ([e3dc42d](https://github.com/DevCloudFE/react-devui/commit/e3dc42df4066ab251641ca0c441f4b4038763b1e))
- **ui:** add `timeline` component ([47679f4](https://github.com/DevCloudFE/react-devui/commit/47679f44f41cd692a0c14744532ef3845c69c743))
- **ui:** add `toast` component ([95c643f](https://github.com/DevCloudFE/react-devui/commit/95c643f13b33a191f68c7eca24b2c55bd4de6be1))
- **ui:** add `transfer` component ([9ca9a48](https://github.com/DevCloudFE/react-devui/commit/9ca9a48ea943eb804581595a249c11dfc5008ac1))
- **ui:** add `tree-select` component ([144240a](https://github.com/DevCloudFE/react-devui/commit/144240a224c509e9e70803b778a1a600ef390e94))
- **ui:** add `tree` component ([fb8a7b3](https://github.com/DevCloudFE/react-devui/commit/fb8a7b346e5ee7f5b72e49919428d3da6efb925e))
- **ui:** add `upload` component ([ef0e55c](https://github.com/DevCloudFE/react-devui/commit/ef0e55ceb81b1607d9ed95c5d2c873e1cdaf38d7))
- **ui:** add `virtual-scroll` component ([9b1cd98](https://github.com/DevCloudFE/react-devui/commit/9b1cd98e934933812120e7dd106f9b7a8130ef57))
- **ui:** add `virtual-scroll` component ([eb1a986](https://github.com/DevCloudFE/react-devui/commit/eb1a9862271c0fd1f0ca93e32a08ecf40d7fd0a4))
- **ui:** add component matedata ([cc56e76](https://github.com/DevCloudFE/react-devui/commit/cc56e76a7b093ea5c8d72f4593742520c9cd6fa6))
- **ui:** add custom trigger node ([78e6fb6](https://github.com/DevCloudFE/react-devui/commit/78e6fb6617ed692d39cf8b1d440196b9b13db694))
- **ui:** add empty state ([8f8d5f7](https://github.com/DevCloudFE/react-devui/commit/8f8d5f7573ab3420851e95d0d91c3020735cebc5))
- **ui:** add listener for scrollview change ([d4ea59e](https://github.com/DevCloudFE/react-devui/commit/d4ea59e4c3a571e590078511f506652a87726511))
- **ui:** add ts check for component configs ([c1f1297](https://github.com/DevCloudFE/react-devui/commit/c1f1297392201434b2ae74e125f41938b9e21bcd))
- **ui:** provide SSR support ([6b83ccb](https://github.com/DevCloudFE/react-devui/commit/6b83ccb3b7ebc6b7dfa1e13fd2dd82338ea0e3d9))
- **ui:** support two-way binding ([246f968](https://github.com/DevCloudFE/react-devui/commit/246f96823855d088708047d2c4c6762758e00a14))
- **ui:** suppot drag on mobile ([46dd985](https://github.com/DevCloudFE/react-devui/commit/46dd985236cd7fd777803eee58ef7554cbc2477a))
- **ui:** use component name as `useDComponentConfig` argument ([4bc6c39](https://github.com/DevCloudFE/react-devui/commit/4bc6c3940479b1f65b03668b97fde56148a841dd))
- update to React 18 Beta ([bfbf6e0](https://github.com/DevCloudFE/react-devui/commit/bfbf6e0dd600d85c5b50b208a4f6a65c5fb05a3e))

### Performance Improvements

- remove unnecessary `useCallback` and `useMemo` ([5959cf7](https://github.com/DevCloudFE/react-devui/commit/5959cf7225ed54a274569b7f3bb88bbd040e35c4))
- **ui:cascader:** optimize performance ([8ef6157](https://github.com/DevCloudFE/react-devui/commit/8ef61571ed848bbdd040a83ac44b03ba3f48e8c5))
- **ui:select:** optimize performance ([6f024fd](https://github.com/DevCloudFE/react-devui/commit/6f024fd4d38cda52615f3328a134e8c4e328bfe1))
- **ui:virtual-scroll:** optimize performance ([e252fb4](https://github.com/DevCloudFE/react-devui/commit/e252fb4451f82cc61abce2b503b15e74dbce82ea))
- **ui:** add `skip` for global scroll ([7f92f7e](https://github.com/DevCloudFE/react-devui/commit/7f92f7e0a82b0776998a0c1d5e4df0e2c0e747e8))
- **ui:** optimizing handle of big data ([542f220](https://github.com/DevCloudFE/react-devui/commit/542f22039166a94a134131062708cf174cfae5ba))
- **ui:** optimizing virtual-scroll ([cce0e71](https://github.com/DevCloudFE/react-devui/commit/cce0e71742b5b652dfdf2331626962a1fb4f5e50))
- **ui:** optimizing virtual-scroll ([d0205a3](https://github.com/DevCloudFE/react-devui/commit/d0205a355157f2a59a97add8ad89c83c1b05d4ba))
