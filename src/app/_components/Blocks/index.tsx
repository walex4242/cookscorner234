import React, { Fragment } from 'react'

import { Page } from '../../../payload/payload-types'
import { ArchiveBlock } from '../../_blocks/ArchiveBlock'
import { CallToActionBlock } from '../../_blocks/CallToAction'
import { ContentBlock } from '../../_blocks/Content'
import { MediaBlock } from '../../_blocks/MediaBlock'
import { RelatedProducts, type RelatedProductsProps } from '../../_blocks/RelatedProducts'
import { toKebabCase } from '../../_utilities/toKebabCase'
import { BackgroundColor } from '../BackgroundColor/index'
import { VerticalPadding, VerticalPaddingOptions } from '../VerticalPadding'
import { FormBlock, type FormBlockType } from './Form'

const blockComponents = {
  cta: CallToActionBlock,
  content: ContentBlock,
  mediaBlock: MediaBlock,
  archive: ArchiveBlock,
  relatedProducts: RelatedProducts,
  formBlock: FormBlock,
}

export const Blocks: React.FC<{
  blocks: Page['layout'] | RelatedProductsProps | FormBlockType
  disableTopPadding?: boolean
  disableBottomPadding?: boolean
}> = props => {
  const { disableTopPadding, disableBottomPadding, blocks } = props
  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockName, blockType, form } = block

          const isFormBlock = blockType === 'formBlock'
          {
            /*@ts-ignore*/
          }
          const formID: string = isFormBlock && form && form.id

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            // the cta block is containerized, so we don't consider it to be inverted at the block-level
            const blockIsInverted =
              'invertBackground' in block && blockType !== 'cta' ? block.invertBackground : false
            const prevBlock = blocks[index - 1]

            const prevBlockInverted =
              prevBlock && 'invertBackground' in prevBlock && prevBlock?.invertBackground

            const isPrevSame = Boolean(blockIsInverted) === Boolean(prevBlockInverted)

            let paddingTop: VerticalPaddingOptions = 'large'
            let paddingBottom: VerticalPaddingOptions = 'large'

            if (prevBlock && isPrevSame) {
              paddingTop = 'none'
            }

            if (index === blocks.length - 1) {
              paddingBottom = 'large'
            }

            if (disableTopPadding && index === 0) {
              paddingTop = 'none'
            }

            if (disableBottomPadding && index === 0) {
              paddingBottom = 'none'
            }

            // if (Block) {
            return (
              // <BackgroundColor key={index} invert={blockIsInverted}>
              <VerticalPadding
                key={FormBlock ? formID : index}
                top={paddingTop}
                bottom={paddingBottom}
              >
                {/*@ts-ignore*/}
                <Block id={toKebabCase(blockName)} {...block} />
              </VerticalPadding>
              // {/* //{' '} */}
              // </BackgroundColor>
            )
            // }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
