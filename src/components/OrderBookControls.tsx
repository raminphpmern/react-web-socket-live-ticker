import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ZoomIn, 
  ZoomOut, 
  ChevronUp, 
  ChevronDown,
  ArrowDownUp
} from 'lucide-react';
import { RootState } from '../store/store';
import { setPrecision, setZoom } from '../store/orderBookSlice';
import { PrecisionLevel } from '../types/orderbook';

const precisionLevels: PrecisionLevel[] = ['P0', 'P1', 'P2', 'P3', 'P4'];

export const OrderBookControls: React.FC = () => {
  const dispatch = useDispatch();
  const { precision, zoom } = useSelector((state: RootState) => state.orderBook);
  const currentPrecisionIndex = precisionLevels.indexOf(precision);

  const handleIncreasePrecision = () => {
    if (currentPrecisionIndex < precisionLevels.length - 1) {
      dispatch(setPrecision(precisionLevels[currentPrecisionIndex + 1]));
    }
  };

  const handleDecreasePrecision = () => {
    if (currentPrecisionIndex > 0) {
      dispatch(setPrecision(precisionLevels[currentPrecisionIndex - 1]));
    }
  };

  const handleZoomIn = () => {
    dispatch(setZoom(zoom * 1.5));
  };

  const handleZoomOut = () => {
    dispatch(setZoom(zoom / 1.5));
  };

  return (
    <div className="order-book__controls">
      <button
        onClick={handleIncreasePrecision}
        disabled={currentPrecisionIndex === precisionLevels.length - 1}
        className="control-button"
        title="Increase Precision"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      <button
        onClick={handleDecreasePrecision}
        disabled={currentPrecisionIndex === 0}
        className="control-button"
        title="Decrease Precision"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
      <div className="divider" />
      <button
        onClick={handleZoomIn}
        className="control-button"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={handleZoomOut}
        className="control-button"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <div className="divider" />
      <button
        className="control-button"
        title="Toggle Price"
      >
        <ArrowDownUp className="w-4 h-4" />
      </button>
    </div>
  );
};