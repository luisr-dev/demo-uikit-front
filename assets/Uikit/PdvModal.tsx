import * as React from 'react'

import { Dialog, Divider } from '@mui/material'
import Slide from '@mui/material/Slide'
import { styled } from '@mui/material/styles'
import { TransitionProps } from '@mui/material/transitions'

import { TColors } from './Colors/TColors'

type TPdvModal = {
  open: boolean
  title?: string
  fullScreen?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  headerColor?: TColors
  footer?: React.ReactElement
  noContainerSpacing?: boolean
  onClose?: () => void // Se ejecuta cuando se hace click fuera del modal
  onSubmit?: () => void //Enento para formularios. Se ejecuta cuando usas un boton type='submit' dentro del children del modal
}

type TPdvModalFooter = {
  className?: string
}

const CustomDialog = styled(Dialog)(() => ({
  '& .css-hppdow': { borderRadius: '1.5rem' },
  '& .css-1t1j96h-MuiPaper-root-MuiDialog-paper': { borderRadius: '1.5rem' },
  '& .css-22jxwj-MuiPaper-root-MuiDialog-paper': { borderRadius: '1.5rem' },
  '& .css-12rl710-MuiPaper-root-MuiDialog-paper': { borderRadius: '1.5rem' },
  '& .css-1fu2e3p-MuiPaper-root-MuiDialog-paper': { borderRadius: '1.5rem' },
  '& .css-2rbg70-MuiPaper-root-MuiDialog-paper': { borderRadius: '1.5rem' }
}))

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

export const PdvModal: React.FC<TPdvModal> = (props) => {
  const fullScreenStyles = props.fullScreen ? '' : 'rounded-t-3xl'
  const modalPadding = props.noContainerSpacing ? '' : 'md:px-6 px-4 md:py-6 py-4'

  return (
    <CustomDialog
      open={props.open}
      TransitionComponent={Transition}
      keepMounted
      maxWidth={props.size ?? 'sm'}
      fullScreen={props.fullScreen}
      sx={{ maxHeight: '95vh', overflow: 'hidden' }}
      onClose={props.onClose}
    >
      <div
        className={`flex h-16 items-center px-4 py-3 md:px-6 ${fullScreenStyles}`}
        style={{ backgroundColor: `var(--${props.headerColor ?? 'indigo-700'})` }}
      >
        <h5 className="text-white">{props.title}</h5>
      </div>
      {props.onSubmit ? (
        <form onSubmit={props.onSubmit}>
          <div className={`no-mobile-scroll-bar h-full overflow-y-auto overflow-x-hidden ${modalPadding}`}>{props.children}</div>
          {props.footer && <div className={modalPadding}>{props.footer}</div>}
        </form>
      ) : (
        <>
          <div className={`no-mobile-scroll-bar h-full overflow-y-auto overflow-x-hidden ${modalPadding}`}>{props.children}</div>
          {props.footer && <div className={modalPadding}>{props.footer}</div>}
        </>
      )}
    </CustomDialog>
  )
}

export const PdvModalFooter: React.FC<TPdvModalFooter> = (props) => {
  return (
    <div>
      <Divider className="mb-4" />
      <div className={`${props.className}`}>{props.children}</div>
    </div>
  )
}