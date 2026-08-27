/**
 * Realistic Studio JPEG Photos for LPG Cylinder Angles
 * 
 * Generated with 4:3 Aspect Ratio and stored as standard .jpg (image/jpeg).
 */

import frontStudioJpg from '../assets/images/cyl_angle1_front_1787737901716.jpg';
import perspStudioJpg from '../assets/images/cyl_angle2_perspective_1787737915409.jpg';
import valveDetailJpg from '../assets/images/cyl_angle3_valve_1787737928156.jpg';
import autoTankJpg from '../assets/images/cyl_auto_tank_1787574106309.jpg';
import campPicnicJpg from '../assets/images/cyl_camp_picnic_1787574124458.jpg';

export interface AngleImageSet {
  front: string;
  perspective: string;
  valveDetail: string;
}

export const REALISTIC_ANGLE_IMAGES = {
  standard: {
    front: frontStudioJpg,
    perspective: perspStudioJpg,
    valveDetail: valveDetailJpg,
  },
  camping: {
    front: campPicnicJpg,
    perspective: perspStudioJpg,
    valveDetail: valveDetailJpg,
  },
  automotive: {
    front: autoTankJpg,
    perspective: autoTankJpg,
    valveDetail: valveDetailJpg,
  },
  industrial: {
    front: frontStudioJpg,
    perspective: perspStudioJpg,
    valveDetail: valveDetailJpg,
  },
};

/**
 * Returns the realistic studio JPEG photo URL for a given product and angle.
 */
export function getProductAnglePhoto(
  category: string,
  volume: number,
  angle: 'front' | 'perspective' | 'valveDetail' | 'real'
): string | null {
  if (category === 'automotive') {
    if (angle === 'front' || angle === 'perspective') return REALISTIC_ANGLE_IMAGES.automotive.front;
    if (angle === 'valveDetail') return REALISTIC_ANGLE_IMAGES.automotive.valveDetail;
  }

  if (volume <= 3) {
    if (angle === 'front') return REALISTIC_ANGLE_IMAGES.camping.front;
    if (angle === 'perspective') return REALISTIC_ANGLE_IMAGES.camping.perspective;
    if (angle === 'valveDetail') return REALISTIC_ANGLE_IMAGES.camping.valveDetail;
  }

  // Default Standard / Industrial cylinders
  if (angle === 'front') return REALISTIC_ANGLE_IMAGES.standard.front;
  if (angle === 'perspective') return REALISTIC_ANGLE_IMAGES.standard.perspective;
  if (angle === 'valveDetail') return REALISTIC_ANGLE_IMAGES.standard.valveDetail;

  return null;
}
